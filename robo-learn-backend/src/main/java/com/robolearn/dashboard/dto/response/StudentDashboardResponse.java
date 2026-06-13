package com.robolearn.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDashboardResponse {
    private long coursesEnrolled;
    private long problemsSolved;
    private long activeAiSequences;
    private int xpPoints;
    private int dailyStreak;
    private List<RecentActivity> recentActivity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private String type; // "COURSE", "PROBLEM", "AI"
        private String title;
        private String status;
        private String timestamp;
    }
}
