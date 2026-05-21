package com.robolearn.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProblemResponse {
    private Long id;
    private String title;
    private String description;
    private String difficulty;
    private String courseId;
    private List<String> tags;
    private String boilerplateCode;
    private List<TestCaseResponse> testCases;
}
