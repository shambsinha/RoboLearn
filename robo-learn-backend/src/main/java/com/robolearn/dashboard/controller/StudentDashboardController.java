package com.robolearn.dashboard.controller;

import com.robolearn.dashboard.dto.response.StudentDashboardResponse;
import com.robolearn.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;

@RestController
@RequestMapping("/api/student/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_STUDENT')")
@Slf4j
public class StudentDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/metrics")
    public ResponseEntity<StudentDashboardResponse> getDashboardMetrics() {
        log.info("Executing getDashboardMetrics");
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            return ResponseEntity.ok(dashboardService.getStudentMetrics(email));
        } catch (Exception e) {
            log.error("Global error in student dashboard metrics", e);
            return ResponseEntity.ok(StudentDashboardResponse.builder()
                    .coursesEnrolled(0)
                    .problemsSolved(0)
                    .activeAiSequences(0)
                    .xpPoints(0)
                    .dailyStreak(0)
                    .recentActivity(new ArrayList<>())
                    .build());
        }
    }
}
