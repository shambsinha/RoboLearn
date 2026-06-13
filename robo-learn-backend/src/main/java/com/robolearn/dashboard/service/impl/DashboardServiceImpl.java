package com.robolearn.dashboard.service.impl;

import com.robolearn.course.entity.Course;

import com.robolearn.dashboard.dto.response.StudentDashboardResponse;
import com.robolearn.user.entity.User;
import com.robolearn.ai.repository.AiToDoListRepository;
import com.robolearn.submission.repository.CodeSubmissionRepository;
import com.robolearn.user.repository.UserRepository;
import com.robolearn.submission.repository.UserSolutionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import com.robolearn.dashboard.dto.response.AdminDashboardResponse;
import com.robolearn.problem.repository.CodingProblemRepository;
import com.robolearn.course.repository.CourseRepository;
import org.springframework.data.domain.Sort;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements com.robolearn.dashboard.service.DashboardService {

    private final UserRepository userRepository;
    private final UserSolutionRepository userSolutionRepository;
    private final AiToDoListRepository aiRepository;
    private final CodeSubmissionRepository submissionRepository;
    private final CourseRepository courseRepository;
    private final CodingProblemRepository problemRepository;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Cacheable(value = "studentDashboard", key = "#email")
    public StudentDashboardResponse getStudentMetrics(String email) {
        log.info("[Performance] Calculating student metrics for {}", email);
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        long coursesEnrolled = student.getEnrolledCourseIds() != null ? student.getEnrolledCourseIds().size() : 0;
        long problemsSolved = userSolutionRepository.countByUserId(student.getId());
        long activeAiSequences = aiRepository.findByUserId(student.getId()).stream()
                .filter(p -> !p.isCompleted())
                .count();

        List<StudentDashboardResponse.RecentActivity> activities = new ArrayList<>();
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
            log.warn("Could not fetch recent submissions for dashboard: {}", e.getMessage());
        }

        return StudentDashboardResponse.builder()
                .coursesEnrolled(coursesEnrolled)
                .problemsSolved(problemsSolved)
                .activeAiSequences(activeAiSequences)
                .xpPoints(student.getXp())
                .dailyStreak(1)
                .recentActivity(activities)
                .build();
    }

    @Cacheable(value = "adminDashboard")
    public AdminDashboardResponse getAdminMetrics() {
        log.info("[Performance] Calculating Admin metrics");
        long totalStudents = userRepository.findAll().stream()
                .filter(u -> u.getRoles() != null && u.getRoles().stream().anyMatch(r -> "STUDENT".equals(r.getName())))
                .count();
        long activeCourses = courseRepository.count();
        long totalProblems = problemRepository.count();

        List<AdminDashboardResponse.RecentActivity> activities = new ArrayList<>();
        courseRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")).stream()
                .limit(5)
                .forEach(c -> activities.add(AdminDashboardResponse.RecentActivity.builder()
                        .type("COURSE")
                        .title("Course: " + c.getTitle())
                        .timestamp(c.getCreatedAt() != null ? c.getCreatedAt().format(formatter) : "Recently")
                        .build()));

        return AdminDashboardResponse.builder()
                .totalStudents(totalStudents)
                .activeCourses(activeCourses)
                .totalProblems(totalProblems)
                .recentActivity(activities.stream().limit(5).collect(Collectors.toList()))
                .build();
    }

    @CacheEvict(value = "studentDashboard", key = "#email")
    public void evictStudentMetrics(String email) {
        log.info("[Performance] Evicting student metrics for {}", email);
    }

    @CacheEvict(value = "adminDashboard", allEntries = true)
    public void evictAdminMetrics() {
        log.info("[Performance] Evicting Admin metrics");
    }
}
