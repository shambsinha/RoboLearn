package com.robolearn.api.dto.response;

import com.robolearn.api.entity.AuthProvider;
import com.robolearn.api.entity.UserRole;
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
    private Long id;
    private String username;
    private String profilePictureUrl;
    private UserRole role;
    private AuthProvider authProvider;
    private Integer xp;
    private java.util.Set<Long> solvedProblemIds;
}
