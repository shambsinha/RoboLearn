package com.robolearn.auth.dto.response;

import com.robolearn.auth.entity.AuthProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String sessionToken;
    private Long id;
    private String username;
    private String profilePictureUrl;
    private String role;
    private AuthProvider authProvider;
    private Integer xp;
    private java.util.Set<Long> solvedProblemIds;
}
