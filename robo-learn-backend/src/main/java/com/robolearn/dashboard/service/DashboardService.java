package com.robolearn.dashboard.service;

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

public interface DashboardService {
    StudentDashboardResponse getStudentMetrics(String email);

    AdminDashboardResponse getAdminMetrics();

    void evictStudentMetrics(String email);

    void evictAdminMetrics();
}
