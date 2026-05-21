package com.robolearn.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuleResponse {
    private String moduleId;
    private String title;
    private Integer serialOrder;
    private List<CurriculumItemResponse> items;
}
