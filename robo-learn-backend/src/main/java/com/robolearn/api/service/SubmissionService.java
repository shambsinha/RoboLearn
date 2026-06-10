package com.robolearn.api.service;

import com.robolearn.api.document.CodeSubmission;
import com.robolearn.api.dto.request.CodeSubmissionRequest;
import com.robolearn.api.dto.response.SubmissionResponse;
import com.robolearn.api.entity.CodingProblem;
import com.robolearn.api.entity.TestCase;
import com.robolearn.api.entity.User;
import com.robolearn.api.exception.ResourceNotFoundException;
import com.robolearn.api.repository.CodeSubmissionRepository;
import com.robolearn.api.repository.CodingProblemRepository;
import com.robolearn.api.repository.TestCaseRepository;
import com.robolearn.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubmissionService {

    private final CodeSubmissionRepository submissionRepository;
    private final CodingProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final TestCaseRepository testCaseRepository;
    private final CodeExecutionEngine executionEngine;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    private final org.springframework.kafka.core.KafkaTemplate<String, com.robolearn.api.dto.request.CodeSubmissionMessage> kafkaTemplate;

    private final com.robolearn.api.repository.UserSolutionRepository userSolutionRepository;
    private final CourseService courseService;
    private final com.robolearn.api.repository.CourseRepository courseRepository;
    private final DashboardService dashboardService;

    @CacheEvict(value = "submissionHistory", key = "#userEmail + '-' + #request.problemId")
    public String submitCode(String userEmail, CodeSubmissionRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        CodingProblem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        CodeSubmission submission = CodeSubmission.builder()
                .userId(user.getId())
                .problemId(problem.getId())
                .code(request.getCode())
                .language(request.getLanguage())
                .status("PENDING")
                .submittedAt(LocalDateTime.now())
                .build();

        if (!request.isRunOnly()) {
            submission = submissionRepository.save(submission);
        } else {
            submission.setId("RUN_" + java.util.UUID.randomUUID().toString());
        }

        if (request.isRunOnly()) {
            executeSynchronously(submission, problem, user.getId(), true);
        } else {
            try {
                com.robolearn.api.dto.request.CodeSubmissionMessage message = com.robolearn.api.dto.request.CodeSubmissionMessage.builder()
                        .submissionId(submission.getId())
                        .problemId(problem.getId())
                        .userId(user.getId())
                        .code(submission.getCode())
                        .language(submission.getLanguage())
                        .runOnly(false)
                        .build();

                kafkaTemplate.send(com.robolearn.api.config.KafkaConfig.SUBMISSIONS_TOPIC, message);
            } catch (Exception e) {
                log.error("Kafka unavailable, falling back to sync execution: {}", e.getMessage());
                executeSynchronously(submission, problem, user.getId(), false);
            }
        }

        return submission.getId();
    }

    private void executeSynchronously(CodeSubmission submission, CodingProblem problem, Long userId, boolean isRunOnly) {
        try {
            List<TestCase> allTestCases = testCaseRepository.findAllById(problem.getTestCaseIds());
            List<TestCase> testCasesToRun = isRunOnly 
                ? allTestCases.stream().filter(tc -> !tc.isHidden()).toList()
                : allTestCases;

            CodeSubmission result = executionEngine.execute(
                    submission,
                    testCasesToRun,
                    problem
            );

            if (result == null) {
                log.error("Execution engine returned null for submission {}", submission.getId());
                sendError(userId, submission.getId(), "Execution failed: No result returned from engine");
                return;
            }

            SubmissionResponse response = SubmissionResponse.builder()
                    .submissionId(result.getId())
                    .status(result.getStatus())
                    .executionTimeMs(result.getExecutionTimeMs())
                    .memoryUsageMb(result.getMemoryUsageMb())
                    .logs(result.getLogs())
                    .result(result.getResult())
                    .totalTestCases(isRunOnly ? testCasesToRun.size() : result.getTotalTestCases())
                    .passedTestCases(result.getPassedTestCases())
                    .submittedAt(result.getSubmittedAt())
                    .testCaseResults(result.getTestCaseResults() == null ? null : result.getTestCaseResults().stream()
                            .map(r -> SubmissionResponse.TestCaseResult.builder()
                                    .id(r.getTestCaseId())
                                    .status(r.getStatus())
                                    .actualOutput(r.isHidden() ? null : r.getActualOutput())
                                    .isHidden(r.isHidden())
                                    .build())
                            .toList())
                    .build();

            if (submission.getId() != null && !submission.getId().startsWith("RUN_")) {
                userRepository.findById(userId).ifPresent(u -> {
                    u.getAttemptedDates().add(java.time.LocalDate.now().toString());
                    userRepository.save(u);
                });
            }

            if ("PASS".equals(result.getStatus())) {
                if (submission.getId() != null && !submission.getId().startsWith("RUN_")) {
                    calculatePercentiles(response, problem.getId());
                    awardXp(userId, problem, submission.getCode(), submission.getLanguage());
                }
                userRepository.findById(userId).ifPresent(u -> response.setUserXp(u.getXp()));
            }

            messagingTemplate.convertAndSend("/topic/submissions/" + userId, response);
        } catch (Exception e) {
            log.error("Error in sync execution", e);
            sendError(userId, submission.getId(), "Execution failed: " + e.getMessage());
        }
    }

    private void awardXp(Long userId, CodingProblem problem, String code, String language) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return;

            if (userSolutionRepository.existsByUserIdAndProblemId(userId, problem.getId())) {
                log.info("User {} already solved problem {}. No XP awarded.", userId, problem.getId());
                return;
            }

            // Evict dashboard cache
            dashboardService.evictStudentMetrics(user.getEmail());

            int xpToAdd = switch (problem.getDifficulty().toUpperCase()) {
                case "EASY" -> 50;
                case "MEDIUM", "MODERATE" -> 100;
                case "HARD", "DIFFICULT" -> 150;
                default -> 50;
            };

            com.robolearn.api.entity.UserSolution solution = com.robolearn.api.entity.UserSolution.builder()
                    .userId(userId)
                    .problemId(problem.getId())
                    .solutionCode(code)
                    .language(language)
                    .difficulty(problem.getDifficulty())
                    .xpAwarded(xpToAdd)
                    .build();
            userSolutionRepository.save(solution);

            user.setXp(user.getXp() + xpToAdd);
            user.getSolvedProblemIds().add(problem.getId());

            String difficulty = problem.getDifficulty().toUpperCase();
            if (difficulty.contains("EASY")) user.setSolvedEasy(user.getSolvedEasy() + 1);
            else if (difficulty.contains("MEDIUM") || difficulty.contains("MODERATE")) user.setSolvedMedium(user.getSolvedMedium() + 1);
            else if (difficulty.contains("HARD") || difficulty.contains("DIFFICULT")) user.setSolvedHard(user.getSolvedHard() + 1);
            else user.setSolvedEasy(user.getSolvedEasy() + 1);

            String today = java.time.LocalDate.now().toString();
            user.getStreakDates().add(today);

            userRepository.save(user);
            
            try {
                String problemIdStr = problem.getId().toString();
                courseRepository.findAll().forEach(course -> {
                    if (course.getModules() != null) {
                        course.getModules().forEach(module -> {
                            if (module.getItems() != null) {
                                module.getItems().forEach(item -> {
                                    if ("PROBLEM".equalsIgnoreCase(item.getType()) && problemIdStr.equals(item.getContentPayload())) {
                                        courseService.markProblemComplete(userId, course.getCourseId(), module.getModuleId(), item.getOrder());
                                    }
                                });
                            }
                        });
                    }
                });
            } catch (Exception e) {
                log.error("Failed to auto-mark problem progress for user {}", userId, e);
            }
        } catch (Exception e) {
            log.error("Failed to award XP to user {}", userId, e);
        }
    }

    private void calculatePercentiles(SubmissionResponse response, Long problemId) {
        long totalPassed = submissionRepository.countByProblemIdAndStatus(problemId, "PASS");
        if (totalPassed <= 1) {
            response.setRuntimePercentile(99.0);
            response.setMemoryPercentile(99.0);
            return;
        }

        long slowerCount = submissionRepository.countByProblemIdAndStatusAndExecutionTimeMsGreaterThan(
                problemId, "PASS", response.getExecutionTimeMs());
        long heavierCount = submissionRepository.countByProblemIdAndStatusAndMemoryUsageMbGreaterThan(
                problemId, "PASS", response.getMemoryUsageMb());

        response.setRuntimePercentile(((double) slowerCount / totalPassed) * 100.0);
        response.setMemoryPercentile(((double) heavierCount / totalPassed) * 100.0);
    }

    private void sendError(Long userId, String submissionId, String error) {
        SubmissionResponse response = SubmissionResponse.builder()
                .submissionId(submissionId)
                .status("SYSTEM_ERROR")
                .logs(error)
                .build();
        messagingTemplate.convertAndSend("/topic/submissions/" + userId, response);
    }

    public SubmissionResponse getSubmissionStatus(String submissionId) {
        CodeSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        return SubmissionResponse.builder()
                .submissionId(submission.getId())
                .status(submission.getStatus())
                .executionTimeMs(submission.getExecutionTimeMs())
                .logs(submission.getLogs())
                .result(submission.getResult())
                .totalTestCases(submission.getTotalTestCases())
                .passedTestCases(submission.getPassedTestCases())
                .build();
    }

    @Cacheable(value = "submissionHistory", key = "#email + '-' + #problemId")
    public List<SubmissionResponse> getProblemSubmissions(String email, Long problemId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return submissionRepository.findByUserIdAndProblemIdOrderBySubmittedAtDesc(user.getId(), problemId).stream()
                .map(s -> SubmissionResponse.builder()
                        .submissionId(s.getId())
                        .status(s.getStatus())
                        .executionTimeMs(s.getExecutionTimeMs())
                        .totalTestCases(s.getTotalTestCases())
                        .passedTestCases(s.getPassedTestCases())
                        .submittedAt(s.getSubmittedAt())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }
}
