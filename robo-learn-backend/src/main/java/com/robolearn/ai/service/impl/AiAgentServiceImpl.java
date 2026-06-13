package com.robolearn.ai.service.impl;

import com.robolearn.dashboard.service.DashboardService;
import com.robolearn.course.entity.Course;

import com.robolearn.ai.entity.AiToDoList;
import com.robolearn.ai.dto.request.AiPathRequest;
import com.robolearn.user.entity.User;
import com.robolearn.ai.repository.AiToDoListRepository;
import com.robolearn.problem.repository.CodingProblemRepository;
import com.robolearn.course.repository.CourseRepository;
import com.robolearn.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

@Service
@RequiredArgsConstructor
public class AiAgentServiceImpl implements com.robolearn.ai.service.AiAgentService {

    private final ChatModel chatModel;
    private final UserRepository userRepository;
    private final AiToDoListRepository aiToDoListRepository;
    private final CourseRepository courseRepository;
    private final CodingProblemRepository problemRepository;
    private final DashboardService dashboardService;

    private static final String PATH_SYSTEM_PROMPT = """
        You are an expert educational tutor for the RoboLearn platform. Your goal is to generate a personalized, step-by-step learning path.
        
        PLATFORM CONTENT:
        Courses: {courseList}
        Problems: {problemList}
        
        STUDENT CONTEXT:
        Studies: {context}
        Learning Goal: {learningGoal}
        
        INSTRUCTIONS:
        1. Break down the goal into exactly 5-8 logical steps.
        2. For EACH step, you MUST suggest 1-2 items from the "PLATFORM CONTENT" above that best match the topic.
        3. Provide the suggested item's type (COURSE or PROBLEM) and its exact ID.
        
        CRITICAL: Return the response as STRICTLY valid JSON.
        The JSON format must be:
        {{
          "tasks": [
            {{
              "title": "Task title",
              "description": "Brief explanation",
              "estimatedHours": 2,
              "suggestions": [
                {{ "type": "COURSE", "id": "uuid", "title": "Course Title" }},
                {{ "type": "PROBLEM", "id": "uuid", "title": "Problem Title" }}
              ]
            }}
          ]
        }}
        
        Do not include markdown formatting. Return ONLY the raw JSON string.
        """;

    private static final String GPT_SYSTEM_PROMPT = """
        You are "RoboLearn GPT", a highly intelligent AI assistant integrated into the RoboLearn educational platform.
        You help students with coding questions, career advice, and technical explanations.
        Be concise, professional, and encouraging. Use markdown for code blocks.
        """;

    @CacheEvict(value = "aiPaths", key = "#userEmail")
    public AiToDoList generateLearningPath(String userEmail, AiPathRequest request) {
        dashboardService.evictStudentMetrics(userEmail);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        // Fetch internal content for context
        String courseList = courseRepository.findAll().stream()
                .map(c -> String.format("[%s] %s (ID: %s)", c.getCategory(), c.getTitle(), c.getCourseId()))
                .collect(java.util.stream.Collectors.joining(", "));

        String problemList = problemRepository.findAll().stream()
                .map(p -> String.format("%s (ID: %s)", p.getTitle(), p.getId()))
                .collect(java.util.stream.Collectors.joining(", "));

        String studentContext = "General Student"; 

        SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(PATH_SYSTEM_PROMPT);
        Message systemMessage = systemPromptTemplate.createMessage(Map.of(
                "courseList", courseList,
                "problemList", problemList,
                "context", studentContext,
                "learningGoal", request.getLearningGoal()
        ));

        UserMessage userMessage = new UserMessage("Generate my internal learning path for: " + request.getLearningGoal());

        Prompt prompt = new Prompt(List.of(systemMessage, userMessage));
        String response = chatModel.call(prompt).getResult().getOutput().getText();
        
        AiToDoList toDoList = AiToDoList.builder()
                .userId(user.getId())
                .learningGoal(request.getLearningGoal())
                .studentContext(studentContext)
                .rawJsonResponse(response)
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .build();

        return aiToDoListRepository.save(toDoList);
    }

    public String chat(String message) {
        Message systemMessage = new UserMessage(GPT_SYSTEM_PROMPT); 
        UserMessage userMessage = new UserMessage(message);
        
        Prompt prompt = new Prompt(List.of(systemMessage, userMessage));
        return chatModel.call(prompt).getResult().getOutput().getText();
    }

    @Cacheable(value = "aiPaths", key = "#userEmail")
    public List<AiToDoList> getUserPaths(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));
        
        return aiToDoListRepository.findByUserId(user.getId());
    }
}
