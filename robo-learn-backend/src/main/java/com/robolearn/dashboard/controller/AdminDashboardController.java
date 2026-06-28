package com.robolearn.dashboard.controller;

import com.robolearn.dashboard.dto.response.AdminDashboardResponse;
import com.robolearn.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Slf4j
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/metrics")
    public ResponseEntity<AdminDashboardResponse> getDashboardMetrics() {
        log.info("Executing getDashboardMetrics");
        try {
            return ResponseEntity.ok(dashboardService.getAdminMetrics());
        } catch (Exception e) {
            log.error("Global error in admin dashboard metrics", e);
            return ResponseEntity.ok(AdminDashboardResponse.builder()
                    .totalStudents(0)
                    .activeCourses(0)
                    .totalProblems(0)
                    .recentActivity(new ArrayList<>())
                    .build());
        }
    }
}
