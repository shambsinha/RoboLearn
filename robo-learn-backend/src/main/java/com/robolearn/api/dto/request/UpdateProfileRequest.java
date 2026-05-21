package com.robolearn.api.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String profilePictureUrl;
    private String bio;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String onboardingStatus;
}
