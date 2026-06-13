package com.robolearn.ai.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "ai_todo_lists")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiToDoList {

    @Id
    private String id;

    private Long userId;

    private String learningGoal;

    private String studentContext; // e.g., Onboarding status

    private String rawJsonResponse; // The AI generated path

    private String status; // e.g., "ACTIVE", "COMPLETED"

    private boolean completed;

    private LocalDateTime createdAt;
}
