package com.robolearn.api.dto.response;

import com.robolearn.api.entity.AuthProvider;
import com.robolearn.api.entity.UserRole;
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
    private UserRole role;
    private AuthProvider authProvider;
    private Integer xp;
    private String bio;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String profilePictureUrl;
    private Set<String> enrolledCourseIds;
    private Set<Long> solvedProblemIds;
    private Integer solvedEasy;
    private Integer solvedMedium;
    private Integer solvedHard;
    private java.time.LocalDateTime joinedAt;
}
