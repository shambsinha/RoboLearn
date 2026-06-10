package com.robolearn.api.dto.response;

import com.robolearn.api.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {
    private Long id;
    private String username;
    private String email;
    private UserRole role;
    private LocalDateTime joinedAt;
    private boolean isSuspended;
    private int progressPercentage; 
    private long coursesEnrolled;
    private long problemsSolved;
    private int xpPoints;
    private int dailyStreak;
}
