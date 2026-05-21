package com.robolearn.api.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "ai_feedback")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiFeedback {

    @Id
    private String id;

    private String submissionId;

    private String feedbackText;

    private List<String> suggestions;

    private LocalDateTime createdAt;
}
