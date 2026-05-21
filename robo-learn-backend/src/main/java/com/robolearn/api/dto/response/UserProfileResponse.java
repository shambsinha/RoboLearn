package com.robolearn.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String profilePictureUrl;
    private String bio;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String onboardingStatus;
    private Integer xp;
    private Long rank;
    private Integer totalSolved;
    private Integer solvedEasy;
    private Integer solvedMedium;
    private Integer solvedHard;
    
    // System total counts for ratio calculation
    private Long totalSystemProblems;
    private Long totalSystemEasy;
    private Long totalSystemMedium;
    private Long totalSystemHard;

    private Set<String> streakDates;
    private Set<String> attemptedDates;
    private java.time.LocalDateTime joinedAt;
}
