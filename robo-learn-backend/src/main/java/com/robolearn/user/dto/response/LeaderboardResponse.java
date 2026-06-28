package com.robolearn.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardResponse {
    private String username;
    private Integer xp;
    private String profilePictureUrl;
    private Integer rank;
    private Integer solvedEasy;
    private Integer solvedMedium;
    private Integer solvedHard;
}
