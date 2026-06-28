package com.robolearn.problem.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "coding_problems")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingProblem {

    @Id
    private Long id;

    private String title;

    private String description;

    private String difficulty; // e.g., EASY, MEDIUM, HARD

    private String courseId;

    private Long createdBy; // Tracks who created the problem


    @Builder.Default
    private List<String> tags = new ArrayList<>();

    private String boilerplateCode;

    private String driverCode;

    @Builder.Default
    private java.util.Map<String, String> driverCodeTemplate = new java.util.HashMap<>();

    @Builder.Default
    private List<Long> testCaseIds = new ArrayList<>();
}
