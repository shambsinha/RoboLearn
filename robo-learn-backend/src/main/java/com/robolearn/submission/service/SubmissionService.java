package com.robolearn.submission.service;

import com.robolearn.submission.dto.request.CodeSubmissionMessage;
import com.robolearn.submission.repository.UserSolutionRepository;
import com.robolearn.course.service.CourseService;
import com.robolearn.course.repository.CourseRepository;
import com.robolearn.dashboard.service.DashboardService;
import com.robolearn.core.config.KafkaConfig;
import com.robolearn.submission.entity.UserSolution;
import com.robolearn.submission.entity.CodeSubmission;
import com.robolearn.submission.dto.request.CodeSubmissionRequest;
import com.robolearn.submission.dto.response.SubmissionResponse;
import com.robolearn.problem.entity.CodingProblem;
import com.robolearn.problem.entity.TestCase;
import com.robolearn.user.entity.User;
import com.robolearn.core.exception.ResourceNotFoundException;
import com.robolearn.submission.repository.CodeSubmissionRepository;
import com.robolearn.problem.repository.CodingProblemRepository;
import com.robolearn.problem.repository.TestCaseRepository;
import com.robolearn.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

public interface SubmissionService {
    String submitCode(String userEmail, CodeSubmissionRequest request);

    SubmissionResponse getSubmissionStatus(String submissionId);

    List<SubmissionResponse> getProblemSubmissions(String email, Long problemId);
}
