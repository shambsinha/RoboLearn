package com.robolearn.contest.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ContestRequest {
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private List<String> problemIds;
}
