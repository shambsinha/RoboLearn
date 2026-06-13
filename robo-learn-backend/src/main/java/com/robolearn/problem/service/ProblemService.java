package com.robolearn.problem.service;

import com.robolearn.submission.repository.CodeSubmissionRepository;
import com.robolearn.submission.entity.CodeSubmission;
import com.robolearn.problem.dto.request.ProblemRequest;
import com.robolearn.problem.dto.request.TestCaseRequest;
import com.robolearn.problem.dto.response.ProblemResponse;
import com.robolearn.problem.dto.response.TestCaseResponse;
import com.robolearn.problem.entity.CodingProblem;
import com.robolearn.course.entity.Course;
import com.robolearn.problem.entity.TestCase;
import com.robolearn.core.exception.ResourceNotFoundException;
import com.robolearn.problem.repository.CodingProblemRepository;
import com.robolearn.course.repository.CourseRepository;
import com.robolearn.problem.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

public interface ProblemService {
    ProblemResponse createProblem(ProblemRequest request);

    TestCaseResponse addTestCase(Long problemId, TestCaseRequest request);

    List<ProblemResponse> getAllProblems();

    ProblemResponse getProblemById(Long id);

    ProblemResponse updateProblem(Long id, ProblemRequest request);

    void deleteProblem(Long id);
}
