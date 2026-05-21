package com.robolearn.api.controller;

import com.robolearn.api.dto.response.StudentDashboardResponse;
import com.robolearn.api.entity.User;
import com.robolearn.api.repository.AiToDoListRepository;
import com.robolearn.api.repository.CodeSubmissionRepository;
import com.robolearn.api.repository.CourseRepository;
import com.robolearn.api.repository.UserRepository;
import com.robolearn.api.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/student/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
@Slf4j
public class StudentDashboardController {

    private final CourseRepository courseRepository;
    private final CodeSubmissionRepository submissionRepository;
    private final AiToDoListRepository aiRepository;
    private final UserRepository userRepository;
    private final com.robolearn.api.repository.UserSolutionRepository userSolutionRepository;

    @GetMapping("/metrics")
    public ResponseEntity<StudentDashboardResponse> getDashboardMetrics() {
        try {
            CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            com.robolearn.api.entity.User student = userDetails.getUser();

            // Get latest user data to have accurate enrollment count
            student = userRepository.findById(student.getId()).orElse(student);

            long coursesEnrolled = student.getEnrolledCourseIds() != null ? student.getEnrolledCourseIds().size() : 0;
            
            // Optimized relational query for problem solved count
            long problemsSolved = userSolutionRepository.countByUserId(student.getId());

            long activeAiSequences = aiRepository.findByUserId(student.getId()).stream()
                    .filter(p -> !p.isCompleted())
                    .count();

            List<StudentDashboardResponse.RecentActivity> activities = new ArrayList<>();
            
            // Add recent submissions as activity - with null safe sorting
            try {
                submissionRepository.findByUserId(student.getId()).stream()
                        .filter(s -> s.getSubmittedAt() != null)
                        .sorted((s1, s2) -> s2.getSubmittedAt().compareTo(s1.getSubmittedAt()))
                        .limit(5)
                        .forEach(s -> activities.add(StudentDashboardResponse.RecentActivity.builder()
                                .type("PROBLEM")
                                .title("Submission for Problem #" + s.getProblemId())
                                .status(s.getStatus())
                                .timestamp("Recently")
                                .build()));
            } catch (Exception e) {
                log.warn("Could not fetch recent submissions for student dashboard: {}", e.getMessage());
            }

            return ResponseEntity.ok(StudentDashboardResponse.builder()
                    .coursesEnrolled(coursesEnrolled)
                    .problemsSolved(problemsSolved)
                    .activeAiSequences(activeAiSequences)
                    .xpPoints(student.getXp())
                    .dailyStreak(1)
                    .recentActivity(activities)
                    .build());
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
