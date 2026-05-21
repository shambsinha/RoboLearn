package com.robolearn.api.service;

import com.robolearn.api.document.CodeSubmission;
import com.robolearn.api.entity.TestCase;
import com.robolearn.api.repository.CodeSubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class CodeExecutionEngine {

    private final CodeSubmissionRepository submissionRepository;
    private static final String TEMP_BASE = Path.of(System.getProperty("user.home"), ".robolearn", "temp").toString();

    public CodeSubmission execute(CodeSubmission submission, List<TestCase> testCases) {
        if (submission == null) return null;

        Path workspace = null;
        try {
            long startTime = System.currentTimeMillis();
            workspace = setupWorkspace(submission, testCases);
            String volumeMapping = workspace.toAbsolutePath().toString().replace("\\", "/") + ":/code";

            // 1. Compilation Phase
            if (isCompiledLanguage(submission.getLanguage())) {
                ExecutionResult compileResult = compile(submission, volumeMapping);
                if (compileResult.exitCode != 0) {
                    return handleCompilationError(submission, compileResult, startTime);
                }
            }

            // 2. Batch Execution Phase (Single Container Run)
            ExecutionResult batchResult = runBatch(submission, testCases, volumeMapping);
            
            // 3. Process All Results
            processResults(submission, workspace, testCases);

            submission.setExecutionTimeMs((double)(System.currentTimeMillis() - startTime));
            return finalizeSubmission(submission);

        } catch (Exception e) {
            log.error("Online Judge Engine Error", e);
            submission.setStatus("SYSTEM_ERROR");
            submission.setLogs("Engine Error: " + e.getMessage());
            return finalizeSubmission(submission);
        } finally {
            if (workspace != null) cleanup(workspace);
        }
    }

    private Path setupWorkspace(CodeSubmission submission, List<TestCase> testCases) throws IOException {
        Files.createDirectories(Path.of(TEMP_BASE));
        Path workspace = Files.createTempDirectory(Path.of(TEMP_BASE), "judge-");
        
        String lang = submission.getLanguage().toLowerCase();
        // Write Source
        if ("python".equals(lang)) {
            Files.writeString(workspace.resolve("solution.py"), submission.getCode());
        } else if ("java".equals(lang)) {
            String className = getClassName(submission.getCode());
            Files.writeString(workspace.resolve(className + ".java"), submission.getCode());
        } else if ("cpp".equals(lang) || "c++".equals(lang)) {
            Files.writeString(workspace.resolve("main.cpp"), submission.getCode());
        }

        // Setup IO
        Files.createDirectories(workspace.resolve("in"));
        Files.createDirectories(workspace.resolve("out"));
        int count = (testCases != null) ? testCases.size() : 1;
        for (int i = 0; i < count; i++) {
            String input = (testCases != null && i < testCases.size()) ? testCases.get(i).getInput() : "";
            Files.writeString(workspace.resolve("in/" + i + ".txt"), input != null ? input : "");
        }

        // Driver Script
        Files.writeString(workspace.resolve("runner.sh"), buildRunnerScript(submission, count));
        
        return workspace;
    }

    private String buildRunnerScript(CodeSubmission submission, int count) {
        String lang = submission.getLanguage().toLowerCase();
        String cmd = switch (lang) {
            case "python" -> "python3 solution.py";
            case "java" -> "java " + getClassName(submission.getCode());
            case "cpp", "c++" -> "./main";
            default -> "echo Error";
        };

        StringBuilder sb = new StringBuilder("#!/bin/sh\n");
        sb.append("for i in $(seq 0 ").append(count - 1).append("); do\n");
        sb.append("  timeout 5s ").append(cmd).append(" < in/$i.txt > out/$i.stdout 2> out/$i.stderr\n");
        sb.append("  echo $? > out/$i.exit\n");
        sb.append("done\n");
        return sb.toString();
    }

    private ExecutionResult compile(CodeSubmission submission, String volumeMapping) throws IOException, InterruptedException {
        String lang = submission.getLanguage().toLowerCase();
        String[] cmd;
        if ("java".equals(lang)) {
            cmd = new String[]{"docker", "run", "--rm", "-v", volumeMapping, "-w", "/code", "eclipse-temurin:17-alpine", "javac", getClassName(submission.getCode()) + ".java"};
        } else {
            cmd = new String[]{"docker", "run", "--rm", "-v", volumeMapping, "-w", "/code", "gcc:13-alpine", "g++", "-O3", "-o", "main", "main.cpp"};
        }
        return runCommand(cmd, 15);
    }

    private ExecutionResult runBatch(CodeSubmission submission, List<TestCase> testCases, String volumeMapping) throws IOException, InterruptedException {
        String lang = submission.getLanguage().toLowerCase();
        String image = switch (lang) {
            case "python" -> "python:3.11-alpine";
            case "java" -> "eclipse-temurin:17-alpine";
            case "cpp", "c++" -> "gcc:13-alpine";
            default -> "alpine:latest";
        };

        String[] cmd = {
            "docker", "run", "--rm", "--network", "none", "--memory", "256m", "--cpus", "1.0",
            "-v", volumeMapping, "-w", "/code", image, "sh", "runner.sh"
        };
        return runCommand(cmd, 30 + (testCases != null ? testCases.size() * 2 : 5));
    }

    private void processResults(CodeSubmission submission, Path workspace, List<TestCase> testCases) throws IOException {
        int count = (testCases != null) ? testCases.size() : 1;
        List<CodeSubmission.TestCaseResult> results = new ArrayList<>();
        int passed = 0;
        String finalStatus = "PASS";
        StringBuilder logSummary = new StringBuilder();

        for (int i = 0; i < count; i++) {
            int exitCode = parseExit(workspace.resolve("out/" + i + ".exit"));
            String stdout = readSafe(workspace.resolve("out/" + i + ".stdout")).trim();
            String stderr = readSafe(workspace.resolve("out/" + i + ".stderr")).trim();

            String status = "PASS";
            if (exitCode == 124) status = "TIME_LIMIT_EXCEEDED";
            else if (exitCode != 0) status = "RUNTIME_ERROR";
            else if (testCases != null) {
                String expected = testCases.get(i).getExpectedOutput() != null ? testCases.get(i).getExpectedOutput().trim() : "";
                if (!stdout.equals(expected)) status = "FAIL";
            }

            if ("PASS".equals(status)) passed++;
            else if ("PASS".equals(finalStatus)) {
                finalStatus = status;
                logSummary.append("================ FAIL DETAILS ================\n");
                logSummary.append("Status: ").append(status).append("\n");
                if (testCases != null && i < testCases.size() && !testCases.get(i).isHidden()) {
                    logSummary.append("Input:    ").append(truncate(testCases.get(i).getInput())).append("\n");
                    logSummary.append("Expected: ").append(truncate(testCases.get(i).getExpectedOutput())).append("\n");
                    logSummary.append("Actual:   ").append(truncate(stdout)).append("\n");
                    if (!stderr.isEmpty()) logSummary.append("Error:    ").append(truncate(stderr)).append("\n");
                } else if (testCases != null && testCases.get(i).isHidden()) {
                    logSummary.append("[Hidden Test Case]\n");
                }
                logSummary.append("==============================================\n");
            }

            results.add(CodeSubmission.TestCaseResult.builder()
                .testCaseId(testCases != null ? testCases.get(i).getId() : null)
                .status(status)
                .actualOutput(stdout)
                .isHidden(testCases != null && testCases.get(i).isHidden())
                .build());
        }

        submission.setStatus(finalStatus);
        submission.setPassedTestCases(passed);
        submission.setTotalTestCases(count);
        submission.setTestCaseResults(results);
        submission.setLogs(logSummary.toString());
        if (testCases == null) submission.setResult(results.get(0).getActualOutput());
    }

    private CodeSubmission handleCompilationError(CodeSubmission sub, ExecutionResult res, long start) {
        sub.setStatus("COMPILATION_ERROR");
        sub.setLogs("Compilation Failed:\n" + res.output.replaceAll("/code/", ""));
        sub.setExecutionTimeMs((double)(System.currentTimeMillis() - start));
        return finalizeSubmission(sub);
    }

    private String getClassName(String code) {
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("public\\s+class\\s+([a-zA-Z0-9_]+)").matcher(code);
        return m.find() ? m.group(1) : "Solution";
    }

    private boolean isCompiledLanguage(String lang) {
        String l = lang.toLowerCase();
        return "java".equals(l) || "cpp".equals(l) || "c++".equals(l);
    }

    private int parseExit(Path p) {
        try { return Integer.parseInt(Files.readString(p).trim()); } catch (Exception e) { return -1; }
    }

    private String readSafe(Path p) {
        try { return Files.exists(p) ? Files.readString(p) : ""; } catch (IOException e) { return ""; }
    }

    private ExecutionResult runCommand(String[] cmd, int timeout) throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(cmd);
        pb.redirectErrorStream(true);
        Process p = pb.start();
        StringBuilder out = new StringBuilder();
        try (BufferedReader r = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
            String line;
            while ((line = r.readLine()) != null) out.append(line).append("\n");
        }
        if (!p.waitFor(timeout, TimeUnit.SECONDS)) { p.destroyForcibly(); return new ExecutionResult(124, "TIMEOUT"); }
        return new ExecutionResult(p.exitValue(), out.toString().trim());
    }

    private String truncate(String s) {
        if (s == null) return "";
        return s.length() > 500 ? s.substring(0, 497) + "..." : s;
    }

    private CodeSubmission finalizeSubmission(CodeSubmission sub) {
        if (sub.getId() != null && !sub.getId().startsWith("RUN_")) return submissionRepository.save(sub);
        return sub;
    }

    private void cleanup(Path dir) {
        try {
            Files.walk(dir).sorted((a, b) -> -a.compareTo(b)).forEach(p -> {
                try { Files.deleteIfExists(p); } catch (IOException ignored) {}
            });
        } catch (IOException ignored) {}
    }

    private static class ExecutionResult {
        int exitCode; String output;
        ExecutionResult(int e, String o) { this.exitCode = e; this.output = o; }
    }
}
