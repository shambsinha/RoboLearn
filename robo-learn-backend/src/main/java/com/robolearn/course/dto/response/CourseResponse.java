package com.robolearn.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponse {
    private String courseId;
    private String title;
    private String description;
    private String difficulty;
    private String level;
    private String category;
    private String imageUrl;
    private java.util.List<String> tags;
    private String instructorName;
    private Long instructorId;
    private List<ModuleResponse> modules;
    private LocalDateTime createdAt;
}
