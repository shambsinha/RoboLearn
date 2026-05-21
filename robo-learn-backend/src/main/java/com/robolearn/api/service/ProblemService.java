package com.robolearn.api.service;

import com.robolearn.api.dto.request.ProblemRequest;
import com.robolearn.api.dto.request.TestCaseRequest;
import com.robolearn.api.dto.response.ProblemResponse;
import com.robolearn.api.dto.response.TestCaseResponse;
import com.robolearn.api.entity.CodingProblem;
import com.robolearn.api.entity.Course;
import com.robolearn.api.entity.TestCase;
import com.robolearn.api.exception.ResourceNotFoundException;
import com.robolearn.api.repository.CodingProblemRepository;
import com.robolearn.api.repository.CourseRepository;
import com.robolearn.api.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProblemService {

    private final CodingProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final CourseRepository courseRepository;
    private final com.robolearn.api.repository.CodeSubmissionRepository submissionRepository;

    public ProblemResponse createProblem(ProblemRequest request) {
        String courseId = null;
        if (request.getCourseId() != null) {
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
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
                .tags(request.getTags() != null ? request.getTags() : new java.util.ArrayList<>())
                .boilerplateCode(request.getBoilerplateCode())
                .build();

        return mapToProblemResponse(problemRepository.save(problem));
    }

    public TestCaseResponse addTestCase(Long problemId, TestCaseRequest request) {
        CodingProblem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

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

    public ProblemResponse getProblemById(Long id) {
        CodingProblem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));
        return mapToProblemResponse(problem);
    }

    public ProblemResponse updateProblem(Long id, ProblemRequest request) {
        CodingProblem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        if (request.getCourseId() != null) {
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
            problem.setCourseId(course.getCourseId());
        } else {
            problem.setCourseId(null);
        }

        problem.setTitle(request.getTitle());
        problem.setDescription(request.getDescription());
        problem.setDifficulty(request.getDifficulty());
        problem.setTags(request.getTags() != null ? request.getTags() : new java.util.ArrayList<>());
        problem.setBoilerplateCode(request.getBoilerplateCode());

        // Clear existing test cases so the frontend can re-add the updated list without duplication
        if (problem.getTestCaseIds() != null && !problem.getTestCaseIds().isEmpty()) {
            testCaseRepository.deleteAllById(problem.getTestCaseIds());
            problem.getTestCaseIds().clear();
        }

        return mapToProblemResponse(problemRepository.save(problem));
    }

    public void deleteProblem(Long id) {
        CodingProblem problem = problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));
        
        // Delete associated test cases
        if (problem.getTestCaseIds() != null && !problem.getTestCaseIds().isEmpty()) {
            testCaseRepository.deleteAllById(problem.getTestCaseIds());
        }

        // Delete associated submissions
        List<com.robolearn.api.document.CodeSubmission> submissions = submissionRepository.findByProblemId(id);
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
                .testCases(testCases)
                .build();
    }

    private ProblemResponse mapToProblemResponseWithCache(CodingProblem problem, java.util.Map<Long, TestCase> testCaseMap) {
        List<TestCaseResponse> testCases = problem.getTestCaseIds() == null ? new java.util.ArrayList<>() : 
                problem.getTestCaseIds().stream()
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