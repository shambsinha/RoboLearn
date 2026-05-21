package com.robolearn.api.service;

import com.robolearn.api.config.KafkaConfig;
import com.robolearn.api.document.CodeSubmission;
import com.robolearn.api.dto.request.CodeSubmissionMessage;
import com.robolearn.api.dto.response.SubmissionResponse;
import com.robolearn.api.entity.CodingProblem;
import com.robolearn.api.entity.TestCase;
import com.robolearn.api.entity.User;
import com.robolearn.api.repository.CodeSubmissionRepository;
import com.robolearn.api.repository.CodingProblemRepository;
import com.robolearn.api.repository.TestCaseRepository;
import com.robolearn.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CodeSubmissionConsumer {

    private final CodeExecutionEngine executionEngine;
    private final CodeSubmissionRepository submissionRepository;
    private final CodingProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final com.robolearn.api.repository.UserSolutionRepository userSolutionRepository;
    private final CourseService courseService;
    private final com.robolearn.api.repository.CourseRepository courseRepository;

    @KafkaListener(topics = KafkaConfig.SUBMISSIONS_TOPIC, groupId = "robolearn-execution-group")
    public void consume(CodeSubmissionMessage message) {
        log.info("[PIPELINE-DEBUG] 1. Consumed message from Kafka. SubmissionId: {}, UserId: {}", 
                 message.getSubmissionId(), message.getUserId());

        String destination = "/topic/submissions/" + message.getUserId();

        try {
            // 2. Fetch test cases
            log.info("[PIPELINE-DEBUG] 2. Fetching problem and test cases for ProblemId: {}", message.getProblemId());
            CodingProblem problem = problemRepository.findById(message.getProblemId()).orElse(null);
            if (problem == null) {
                log.error("[PIPELINE-DEBUG] ERROR: Problem not found for ID: {}", message.getProblemId());
                sendError(message.getUserId(), message.getSubmissionId(), "Problem not found");
                return;
            }
            List<TestCase> testCases = testCaseRepository.findAllById(problem.getTestCaseIds());
            log.info("[PIPELINE-DEBUG] 3. Found {} test cases. Starting execution engine.", testCases.size());

            // 3. Execute code
            CodeSubmission submission = CodeSubmission.builder()
                    .id(message.getSubmissionId())
                    .userId(message.getUserId())
                    .problemId(message.getProblemId())
                    .code(message.getCode())
                    .language(message.getLanguage())
                    .build();

            submission = executionEngine.execute(
                    submission,
                    testCases
            );

            if (submission == null) {
                log.error("[PIPELINE-DEBUG] ERROR: Execution engine returned null for submission: {}", message.getSubmissionId());
                sendError(message.getUserId(), message.getSubmissionId(), "Execution failed: No result returned from engine");
                return;
            }

            // 4. Push result via WebSocket
            SubmissionResponse response = SubmissionResponse.builder()
                    .submissionId(submission.getId())
                    .status(submission.getStatus())
                    .executionTimeMs(submission.getExecutionTimeMs())
                    .logs(submission.getLogs())
                    .result(submission.getResult())
                    .totalTestCases(submission.getTotalTestCases())
                    .passedTestCases(submission.getPassedTestCases())
                    .testCaseResults(submission.getTestCaseResults() == null ? null : submission.getTestCaseResults().stream()
                            .map(r -> SubmissionResponse.TestCaseResult.builder()
                                    .id(r.getTestCaseId())
                                    .status(r.getStatus())
                                    .actualOutput(r.getActualOutput())
                                    .isHidden(r.isHidden())
                                    .build())
                            .toList())
                    .build();

            log.info("[PIPELINE-DEBUG] 4. Execution complete. Pushing response to: {}. Status: {}", 
                     destination, response.getStatus());
            
            // AWARD XP IF PASSED
            if ("PASS".equals(submission.getStatus())) {
                awardXp(message.getUserId(), problem, message.getCode(), message.getLanguage());
                
                // Fetch updated user for current XP
                userRepository.findById(message.getUserId()).ifPresent(u -> response.setUserXp(u.getXp()));
            }

            messagingTemplate.convertAndSend(destination, response);

        } catch (Exception e) {
            log.error("[PIPELINE-DEBUG] CRITICAL ERROR in consumer: {}", e.getMessage(), e);
            sendError(message.getUserId(), message.getSubmissionId(), "Internal Execution Error: " + e.getMessage());
        }
    }

    private void awardXp(Long userId, CodingProblem problem, String code, String language) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return;

            if (userSolutionRepository.existsByUserIdAndProblemId(userId, problem.getId())) return;

            int xpToAdd = switch (problem.getDifficulty().toUpperCase()) {
                case "EASY" -> 50;
                case "MEDIUM", "MODERATE" -> 100;
                case "HARD", "DIFFICULT" -> 150;
                default -> 50;
            };

            // Save to Relational DB (Neon)
            com.robolearn.api.entity.UserSolution solution = com.robolearn.api.entity.UserSolution.builder()
                    .userId(userId)
                    .problemId(problem.getId())
                    .solutionCode(code)
                    .language(language)
                    .difficulty(problem.getDifficulty())
                    .xpAwarded(xpToAdd)
                    .build();
            userSolutionRepository.save(solution);

            user.setXp(user.getXp() + xpToAdd);
            user.getSolvedProblemIds().add(problem.getId());
            userRepository.save(user);

            // NEW: Automatically mark as complete in all courses that contain this problem
            try {
                String problemIdStr = problem.getId().toString();
                courseRepository.findByProblemIdInCurriculum(problemIdStr).forEach(course -> {
                    if (course.getModules() != null) {
                        course.getModules().forEach(module -> {
                            if (module.getItems() != null) {
                                module.getItems().forEach(item -> {
                                    if ("PROBLEM".equalsIgnoreCase(item.getType()) && problemIdStr.equals(item.getContentPayload())) {
                                        courseService.markProblemComplete(userId, course.getCourseId(), module.getModuleId(), item.getOrder());
                                    }
                                });
                            }
                        });
                    }
                });
            } catch (Exception e) {
                log.error("Failed to auto-mark problem progress for user {}", userId, e);
            }
        } catch (Exception e) {
            log.error("Failed to award XP in consumer", e);
        }
    }

    private void sendError(Long userId, String submissionId, String error) {
        String destination = "/topic/submissions/" + userId;
        log.warn("[PIPELINE-DEBUG] Sending ERROR payload to {}: {}", destination, error);
        SubmissionResponse response = SubmissionResponse.builder()
                .submissionId(submissionId)
                .status("SYSTEM_ERROR")
                .logs(error)
                .build();
        messagingTemplate.convertAndSend(destination, response);
    }
}