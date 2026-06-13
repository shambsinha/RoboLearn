package com.robolearn.course.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "courses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    private String courseId;

    private String title;

    private String description;

    private String level;

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    private String category;

    private String imageUrl;

    private Long instructorId;

    @Builder.Default
    private List<Module> modules = new ArrayList<>();

    @Builder.Default
    private List<Long> problemIds = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;
}
