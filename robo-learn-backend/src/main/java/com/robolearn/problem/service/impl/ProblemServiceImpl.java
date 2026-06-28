package com.robolearn.problem.service.impl;

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
import com.robolearn.auth.security.CustomUserDetails;
import com.robolearn.user.entity.User;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProblemServiceImpl implements com.robolearn.problem.service.ProblemService {

    private final CodingProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final CourseRepository courseRepository;
    private final com.robolearn.submission.repository.CodeSubmissionRepository submissionRepository;

    private void verifyProblemOwnership(CodingProblem problem) {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User currentUser = userDetails.getUser();
        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN"));
        
        // If tied to a course, check course ownership
        if (problem.getCourseId() != null) {
            Course course = courseRepository.findById(problem.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException(com.robolearn.core.exception.ErrorMessages.COURSE_NOT_FOUND));
            if (!isAdmin && (course.getCreatedBy() == null || !course.getCreatedBy().equals(currentUser.getId()))) {
                throw new RuntimeException("You do not have permission to modify this problem tied to course: " + course.getTitle());
            }
        } else {
            // Standalone problem ownership
            if (!isAdmin && (problem.getCreatedBy() == null || !problem.getCreatedBy().equals(currentUser.getId()))) {
                throw new RuntimeException(com.robolearn.core.exception.ErrorMessages.PROBLEM_MODIFICATION_DENIED_STANDALONE);
            }
        }
    }

    @CacheEvict(value = "problems", allEntries = true)
    public ProblemResponse createProblem(ProblemRequest request) {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User currentUser = userDetails.getUser();

        String courseId = null;
        if (request.getCourseId() != null) {
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException(com.robolearn.core.exception.ErrorMessages.COURSE_NOT_FOUND));
            
            // Check course ownership for new problems tied to course
            boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN"));
            if (!isAdmin && (course.getCreatedBy() == null || !course.getCreatedBy().equals(currentUser.getId()))) {
                throw new RuntimeException(com.robolearn.core.exception.ErrorMessages.PROBLEM_ADD_DENIED);
            }
            
            courseId = course.getCourseId();
        }

        long nextId = problemRepository.findTopByOrderByIdDesc()
                .map(p -> p.getId() != null ? p.getId() + 1 : 1L)
                .orElse(1L);

        CodingProblem problem = CodingProblem.builder()
                .id(nextId)
                .title(request.getTitle())
                .description(request.getDescription())
                .difficulty(request.getDifficulty())
                .courseId(courseId)
                .createdBy(currentUser.getId())
                .tags(request.getTags() != null ? request.getTags() : new java.util.ArrayList<>())
                .boilerplateCode(request.getBoilerplateCode())
                .driverCode(request.getDriverCode())
                .build();

        return mapToProblemResponse(problemRepository.save(problem));
    }

    @CacheEvict(value = "problemDetails", key = "#problemId")
    public TestCaseResponse addTestCase(Long problemId, TestCaseRequest request) {
        CodingProblem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException(com.robolearn.core.exception.ErrorMessages.PROBLEM_NOT_FOUND));
        verifyProblemOwnership(problem);

        TestCase testCase = TestCase.builder()
                .id(System.currentTimeMillis())
                .input(request.getInput())
                .expectedOutput(request.getExpectedOutput())
                .isHidden(request.isHidden())
                .problemId(problem.getId())
                .build();

        testCase = testCaseRepository.save(testCase);
        
        if (problem.getTestCaseIds() == null) {
            problem.setTestCaseIds(new java.util.ArrayList<>());
        }
        problem.getTestCaseIds().add(testCase.getId());
        problemRepository.save(problem);

        return mapToTestCaseResponse(testCase);
    }

    @Cacheable(value = "problems")
    public List<ProblemResponse> getAllProblems() {
        List<CodingProblem> problems = problemRepository.findAll();
        
        // Batch fetch all test cases for all problems to avoid N+1
        List<Long> allTestCaseIds = problems.stream()
                .flatMap(p -> p.getTestCaseIds() != null ? p.getTestCaseIds().stream() : java.util.stream.Stream.empty())
                .distinct()
                .collect(Collectors.toList());
        
        java.util.Map<Long, TestCase> testCaseMap = testCaseRepository.findAllById(allTestCaseIds).stream()
                .collect(Collectors.toMap(TestCase::getId, tc -> tc));

        return problems.stream()
                .map(p -> mapToProblemResponseWithCache(p, testCaseMap))
                .collect(Collectors.toList());
    }

    @Cacheable(value = "problemDetails", key = "#id")
    public ProblemResponse getProblemById(Long id) {
        CodingProblem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(com.robolearn.core.exception.ErrorMessages.PROBLEM_NOT_FOUND));
        return mapToProblemResponse(problem);
    }

    @Caching(evict = {
        @CacheEvict(value = "problems", allEntries = true),
        @CacheEvict(value = "problemDetails", key = "#id")
    })
    public ProblemResponse updateProblem(Long id, ProblemRequest request) {
        CodingProblem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(com.robolearn.core.exception.ErrorMessages.PROBLEM_NOT_FOUND));
        verifyProblemOwnership(problem);

        if (request.getCourseId() != null) {
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException(com.robolearn.core.exception.ErrorMessages.COURSE_NOT_FOUND));
            problem.setCourseId(course.getCourseId());
        } else {
            problem.setCourseId(null);
        }

        problem.setTitle(request.getTitle());
        problem.setDescription(request.getDescription());
        problem.setDifficulty(request.getDifficulty());
        problem.setTags(request.getTags() != null ? request.getTags() : new java.util.ArrayList<>());
        problem.setBoilerplateCode(request.getBoilerplateCode());
        problem.setDriverCode(request.getDriverCode());

        // Clear existing test cases so the frontend can re-add the updated list without duplication
        if (problem.getTestCaseIds() != null && !problem.getTestCaseIds().isEmpty()) {
            testCaseRepository.deleteAllById(problem.getTestCaseIds());
            problem.getTestCaseIds().clear();
        }

        return mapToProblemResponse(problemRepository.save(problem));
    }

    @Caching(evict = {
        @CacheEvict(value = "problems", allEntries = true),
        @CacheEvict(value = "problemDetails", key = "#id")
    })
    public void deleteProblem(Long id) {
        CodingProblem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(com.robolearn.core.exception.ErrorMessages.PROBLEM_NOT_FOUND));
        verifyProblemOwnership(problem);
        
        // Delete associated test cases
        if (problem.getTestCaseIds() != null && !problem.getTestCaseIds().isEmpty()) {
            testCaseRepository.deleteAllById(problem.getTestCaseIds());
        }

        // Delete associated submissions
        List<com.robolearn.submission.entity.CodeSubmission> submissions = submissionRepository.findByProblemId(id);
        int count = submissions.size();
        submissionRepository.deleteAll(submissions);
        log.info("Deleted {} submissions for problem ID {}", count, id);
        
        problemRepository.delete(problem);
    }

    private ProblemResponse mapToProblemResponse(CodingProblem problem) {
        List<Long> tcIds = problem.getTestCaseIds() == null ? new java.util.ArrayList<>() : problem.getTestCaseIds();
        List<TestCaseResponse> testCases = testCaseRepository.findAllById(tcIds).stream()
                .map(this::mapToTestCaseResponse)
                .collect(Collectors.toList());

        return ProblemResponse.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .description(problem.getDescription())
                .difficulty(problem.getDifficulty())
                .courseId(problem.getCourseId())
                .tags(problem.getTags())
                .boilerplateCode(problem.getBoilerplateCode())
                .driverCode(problem.getDriverCode())
                .totalTestCases(tcIds.size())
                .testCases(testCases)
                .build();
    }

    private ProblemResponse mapToProblemResponseWithCache(CodingProblem problem, java.util.Map<Long, TestCase> testCaseMap) {
        List<Long> tcIds = problem.getTestCaseIds() == null ? new java.util.ArrayList<>() : problem.getTestCaseIds();
        List<TestCaseResponse> testCases = tcIds.stream()
                .map(testCaseMap::get)
                .filter(java.util.Objects::nonNull)
                .map(this::mapToTestCaseResponse)
                .collect(Collectors.toList());

        return ProblemResponse.builder()
                .id(problem.getId())
                .title(problem.getTitle())
                .description(problem.getDescription())
                .difficulty(problem.getDifficulty())
                .courseId(problem.getCourseId())
                .tags(problem.getTags())
                .boilerplateCode(problem.getBoilerplateCode())
                .driverCode(problem.getDriverCode())
                .totalTestCases(tcIds.size())
                .testCases(testCases)
                .build();
    }

    private TestCaseResponse mapToTestCaseResponse(TestCase testCase) {
        return TestCaseResponse.builder()
                .id(testCase.getId())
                .input(testCase.getInput())
                .expectedOutput(testCase.getExpectedOutput())
                .isHidden(testCase.isHidden())
                .build();
    }
}
