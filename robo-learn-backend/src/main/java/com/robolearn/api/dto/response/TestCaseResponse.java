package com.robolearn.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestCaseResponse {
    private Long id;
    private String input;
    private String expectedOutput;
    private boolean isHidden;
}
