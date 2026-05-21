package com.robolearn.api.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "code_submissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeSubmission {

    @Id
    private String id;

    private Long userId;

    private Long problemId;

    private String code;

    private String language;

    private String status; // e.g., PENDING, PASS, FAIL, COMPILATION_ERROR

    private String result; // Detailed execution result/output

    private Double executionTimeMs;

    private Double memoryUsageMb;

    private String logs;

    private Integer totalTestCases;

    private Integer passedTestCases;

    private java.util.List<TestCaseResult> testCaseResults;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestCaseResult {
        private Long testCaseId;
        private String status; // PASS, FAIL, ERROR
        private String actualOutput;
        private boolean isHidden;
    }

    private LocalDateTime submittedAt;
}
