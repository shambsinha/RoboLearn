package com.robolearn.course.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurriculumItemRequest {
    @NotNull(message = "Order is required")
    private Integer order;
    @NotBlank(message = "Type is required")
    private String type;
    @NotBlank(message = "Content payload is required")
    private String contentPayload;
    @NotBlank(message = "Title is required")
    private String title;
}
