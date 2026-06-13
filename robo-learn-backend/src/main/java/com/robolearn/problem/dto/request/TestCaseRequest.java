package com.robolearn.problem.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseRequest {
    @NotBlank(message = "Input is required")
    private String input;
    @NotBlank(message = "Expected output is required")
    private String expectedOutput;
    private boolean isHidden;
}
