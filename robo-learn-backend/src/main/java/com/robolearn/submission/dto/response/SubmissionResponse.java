package com.robolearn.submission.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionResponse {
    private String submissionId;
    private String status; // PENDING, PASS, FAIL, COMPILATION_ERROR
    private Double executionTimeMs;
    private String logs;
    private String result; // Actual program stdout/output
    private Double memoryUsageMb;
    private Double runtimePercentile;
    private Double memoryPercentile;
    private Integer userXp;
    private Integer totalTestCases;
    private Integer passedTestCases;
    private java.util.List<TestCaseResult> testCaseResults;
    private java.time.LocalDateTime submittedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestCaseResult {
        private Long id;
        private String status; // PASS, FAIL, ERROR
        private String actualOutput;
        private boolean isHidden;
    }
}
