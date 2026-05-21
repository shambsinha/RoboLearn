package com.robolearn.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurriculumItemResponse {
    private Integer order;
    private String type;
    private String contentPayload;
    private String title;
}
