package com.robolearn.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseRequest {
    @NotBlank(message = "Title is required")
    private String title;
    private String description;
    private String level;
    private String category;
    private String imageUrl;
    private java.util.List<String> tags;
}
