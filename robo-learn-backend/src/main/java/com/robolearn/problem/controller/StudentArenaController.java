package com.robolearn.problem.controller;

import com.robolearn.submission.dto.request.CodeSubmissionRequest;
import com.robolearn.problem.dto.response.ProblemResponse;
import com.robolearn.submission.dto.response.SubmissionResponse;
import com.robolearn.problem.dto.response.TestCaseResponse;
import com.robolearn.problem.service.ProblemService;
import com.robolearn.submission.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student/arena")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('PROBLEM_READ')")
public class StudentArenaController {

    private final ProblemService problemService;
    private final SubmissionService submissionService;

    @GetMapping("/problems")
    public ResponseEntity<List<ProblemResponse>> getAllProblems() {
        List<ProblemResponse> problems = problemService.getAllProblems();
        // Strictly exclude test case details from the list for security/fairness
        problems.forEach(p -> p.setTestCases(null));
        return ResponseEntity.ok(problems);
    }

    @GetMapping("/problems/{id}")
    public ResponseEntity<ProblemResponse> getProblemById(@PathVariable Long id) {
        ProblemResponse problem = problemService.getProblemById(id);
        // Exclude hidden test cases and mask expected output of visible ones if needed
        // For now, only show non-hidden test cases and only their inputs
        List<TestCaseResponse> publicTestCases = problem.getTestCases().stream()
                .filter(tc -> !tc.isHidden())
                .map(tc -> TestCaseResponse.builder()
                        .id(tc.getId())
                        .input(tc.getInput())
                        // expectedOutput is intentionally excluded or could be shown for public test cases
                        .expectedOutput(tc.getExpectedOutput()) 
                        .isHidden(false)
                        .build())
                .collect(Collectors.toList());
        problem.setTestCases(publicTestCases);
        return ResponseEntity.ok(problem);
    }

    @PostMapping("/submit")
    public ResponseEntity<String> submitCode(@Valid @RequestBody CodeSubmissionRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String submissionId = submissionService.submitCode(email, request);
        return ResponseEntity.accepted().body(submissionId);
    }

    @GetMapping("/submissions/{submissionId}")
    public ResponseEntity<SubmissionResponse> getSubmissionStatus(@PathVariable String submissionId) {
        return ResponseEntity.ok(submissionService.getSubmissionStatus(submissionId));
    }

    @GetMapping("/problems/{problemId}/submissions")
    public ResponseEntity<List<SubmissionResponse>> getProblemSubmissions(@PathVariable Long problemId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(submissionService.getProblemSubmissions(email, problemId));
    }
}
