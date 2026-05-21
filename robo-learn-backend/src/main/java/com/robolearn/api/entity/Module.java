package com.robolearn.api.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Module {

    private String moduleId;

    private String title;

    private Integer serialOrder;

    @Builder.Default
    private List<CurriculumItem> items = new ArrayList<>();
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CurriculumItem {
        private Integer order;
        private String type; // "VIDEO", "THEORY", "PROBLEM"
        private String contentPayload;
        private String title;
    }
}