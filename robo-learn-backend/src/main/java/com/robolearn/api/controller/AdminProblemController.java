package com.robolearn.api.controller;

import com.robolearn.api.dto.request.ProblemRequest;
import com.robolearn.api.dto.request.TestCaseRequest;
import com.robolearn.api.dto.response.ProblemResponse;
import com.robolearn.api.dto.response.TestCaseResponse;
import com.robolearn.api.service.ProblemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/problems")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProblemController {

    private final ProblemService problemService;

    @PostMapping
    public ResponseEntity<ProblemResponse> createProblem(@Valid @RequestBody ProblemRequest request) {
        return ResponseEntity.ok(problemService.createProblem(request));
    }

    @PostMapping("/{problemId}/testcases")
    public ResponseEntity<TestCaseResponse> addTestCase(@PathVariable Long problemId, @Valid @RequestBody TestCaseRequest request) {
        return ResponseEntity.ok(problemService.addTestCase(problemId, request));
    }

    @GetMapping
    public ResponseEntity<List<ProblemResponse>> getAllProblems() {
        return ResponseEntity.ok(problemService.getAllProblems());
    }

    @GetMapping("/{problemId}")
    public ResponseEntity<ProblemResponse> getProblemById(@PathVariable Long problemId) {
        return ResponseEntity.ok(problemService.getProblemById(problemId));
    }

    @PutMapping("/{problemId}")
    public ResponseEntity<ProblemResponse> updateProblem(@PathVariable Long problemId, @Valid @RequestBody ProblemRequest request) {
        return ResponseEntity.ok(problemService.updateProblem(problemId, request));
    }

    @DeleteMapping("/{problemId}")
    public ResponseEntity<Void> deleteProblem(@PathVariable Long problemId) {
        problemService.deleteProblem(problemId);
        return ResponseEntity.noContent().build();
    }
}
