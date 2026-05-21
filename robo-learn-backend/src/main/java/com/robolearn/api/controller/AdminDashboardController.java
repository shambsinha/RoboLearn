package com.robolearn.api.controller;

import com.robolearn.api.dto.response.AdminDashboardResponse;
import com.robolearn.api.entity.Course;
import com.robolearn.api.entity.CodingProblem;
import com.robolearn.api.entity.UserRole;
import com.robolearn.api.repository.CodingProblemRepository;
import com.robolearn.api.repository.CourseRepository;
import com.robolearn.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class AdminDashboardController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CodingProblemRepository problemRepository;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @GetMapping("/metrics")
    public ResponseEntity<AdminDashboardResponse> getDashboardMetrics() {
        try {
            long totalStudents = 0;
            try {
                totalStudents = userRepository.findAll().stream()
                        .filter(u -> u.getRole() != null && "STUDENT".equals(u.getRole().name()))
                        .count();
            } catch (Exception e) {
                log.warn("Error counting students: {}", e.getMessage());
                totalStudents = userRepository.count(); // Fallback to all users
            }
            long activeCourses = courseRepository.count();
            long totalProblems = problemRepository.count();

            List<AdminDashboardResponse.RecentActivity> activities = new ArrayList<>();

            // Safe fetch recent courses
            try {
                courseRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                        .limit(5)
                        .forEach(c -> activities.add(AdminDashboardResponse.RecentActivity.builder()
                                .type("COURSE")
                                .title("Course: " + c.getTitle())
                                .timestamp(c.getCreatedAt() != null ? c.getCreatedAt().format(formatter) : "Recently")
                                .build()));
            } catch (Exception e) {
                log.warn("Could not fetch recent courses for dashboard: {}", e.getMessage());
            }

            // Safe fetch recent problems
            try {
                problemRepository.findAll().stream()
                        .sorted((p1, p2) -> p2.getId().compareTo(p1.getId()))
                        .limit(5)
                        .forEach(p -> activities.add(AdminDashboardResponse.RecentActivity.builder()
                                .type("PROBLEM")
                                .title("Challenge: " + p.getTitle())
                                .timestamp("Recently")
                                .build()));
            } catch (Exception e) {
                log.warn("Could not fetch recent problems for dashboard: {}", e.getMessage());
            }

            return ResponseEntity.ok(AdminDashboardResponse.builder()
                    .totalStudents(totalStudents)
                    .activeCourses(activeCourses)
                    .totalProblems(totalProblems)
                    .recentActivity(activities.stream().limit(5).collect(Collectors.toList()))
                    .build());
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
