package com.robolearn.contest.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "contests")
public class Contest {
    @Id
    private String id;
    private String title;
    private String description;
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    private Long createdBy; // ID of the ADMIN or INSTRUCTOR
    
    @Builder.Default
    private List<String> problemIds = new ArrayList<>();
    
    @Builder.Default
    private Set<Long> enrolledUserIds = new HashSet<>();
}
