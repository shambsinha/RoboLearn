package com.robolearn.api.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodeSubmissionMessage {
    private String submissionId;
    private Long problemId;
    private Long userId;
    private String code;
    private String language;
    private boolean runOnly;
}