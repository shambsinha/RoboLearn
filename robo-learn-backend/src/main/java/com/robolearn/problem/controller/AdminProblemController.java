package com.robolearn.problem.controller;

import com.robolearn.problem.dto.request.ProblemRequest;
import com.robolearn.problem.dto.request.TestCaseRequest;
import com.robolearn.problem.dto.response.ProblemResponse;
import com.robolearn.problem.dto.response.TestCaseResponse;
import com.robolearn.problem.service.ProblemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/problems")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class AdminProblemController {

    private final ProblemService problemService;

    @PostMapping
    @PreAuthorize("hasAuthority('PROBLEM_CREATE')")
    public ResponseEntity<ProblemResponse> createProblem(@Valid @RequestBody ProblemRequest request) {
        log.info("Executing createProblem");
        return ResponseEntity.ok(problemService.createProblem(request));
    }

    @PostMapping("/{problemId}/testcases")
    @PreAuthorize("hasAuthority('PROBLEM_CREATE') or hasAuthority('PROBLEM_UPDATE')")
    public ResponseEntity<TestCaseResponse> addTestCase(@PathVariable Long problemId, @Valid @RequestBody TestCaseRequest request) {
        log.info("Executing addTestCase with problemId={}", problemId);
        return ResponseEntity.ok(problemService.addTestCase(problemId, request));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PROBLEM_READ')")
    public ResponseEntity<List<ProblemResponse>> getAllProblems() {
        log.info("Executing getAllProblems");
        return ResponseEntity.ok(problemService.getAllProblems());
    }

    @GetMapping("/{problemId}")
    @PreAuthorize("hasAuthority('PROBLEM_READ')")
    public ResponseEntity<ProblemResponse> getProblemById(@PathVariable Long problemId) {
        log.info("Executing getProblemById with problemId={}", problemId);
        return ResponseEntity.ok(problemService.getProblemById(problemId));
    }

    @PutMapping("/{problemId}")
    @PreAuthorize("hasAuthority('PROBLEM_UPDATE')")
    public ResponseEntity<ProblemResponse> updateProblem(@PathVariable Long problemId, @Valid @RequestBody ProblemRequest request) {
        log.info("Executing updateProblem with problemId={}", problemId);
        return ResponseEntity.ok(problemService.updateProblem(problemId, request));
    }

    @DeleteMapping("/{problemId}")
    @PreAuthorize("hasAuthority('PROBLEM_DELETE')")
    public ResponseEntity<Void> deleteProblem(@PathVariable Long problemId) {
        log.info("Executing deleteProblem with problemId={}", problemId);
        problemService.deleteProblem(problemId);
        return ResponseEntity.noContent().build();
    }
}
