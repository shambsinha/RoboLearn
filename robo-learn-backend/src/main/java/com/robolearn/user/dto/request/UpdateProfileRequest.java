package com.robolearn.user.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String username;
    private String profilePictureUrl;
    private String bio;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
}
