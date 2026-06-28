package com.robolearn.contest.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ContestResponse {
    private String id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long createdBy;
    private List<String> problemIds;
    private int enrolledCount;
    private boolean isEnrolled;
}
