package com.robolearn.api.service;

import com.robolearn.api.document.AiToDoList;
import com.robolearn.api.dto.request.AiPathRequest;
import com.robolearn.api.entity.User;
import com.robolearn.api.repository.AiToDoListRepository;
import com.robolearn.api.repository.UserRepository;
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

@Service
@RequiredArgsConstructor
public class AiAgentService {

    private final ChatModel chatModel;
    private final UserRepository userRepository;
    private final AiToDoListRepository aiToDoListRepository;

    private static final String SYSTEM_PROMPT = """
        You are an expert educational tutor. Your goal is to generate a personalized, step-by-step learning path for a student.
        
        The student is currently in their {onboardingStatus} of studies.
        Their learning goal is: {learningGoal}.
        
        Please provide a structured learning path.
        CRITICAL: Return the response as STRICTLY valid JSON.
        The JSON should contain an array of "tasks", where each task has:
        - "title": A short title of the task.
        - "description": A brief explanation of what to study or do.
        - "estimatedHours": The estimated time required for this task.
        
        Do not include markdown formatting like ```json in your response. Return ONLY the raw JSON string.
        """;

    public AiToDoList generateLearningPath(String userEmail, AiPathRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        String onboardingStatus = user.getOnboardingStatus() != null ? user.getOnboardingStatus() : "General";

        SystemPromptTemplate systemPromptTemplate = new SystemPromptTemplate(SYSTEM_PROMPT);
        Message systemMessage = systemPromptTemplate.createMessage(Map.of(
                "onboardingStatus", onboardingStatus,
                "learningGoal", request.getLearningGoal()
        ));

        UserMessage userMessage = new UserMessage("Generate my learning path for: " + request.getLearningGoal());

        Prompt prompt = new Prompt(List.of(systemMessage, userMessage));
        String response = chatModel.call(prompt).getResult().getOutput().getContent();
        AiToDoList toDoList = AiToDoList.builder()
                .userId(user.getId())
                .learningGoal(request.getLearningGoal())
                .studentContext(onboardingStatus)
                .rawJsonResponse(response)
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .build();

        return aiToDoListRepository.save(toDoList);
    }

    public List<AiToDoList> getUserPaths(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));
        
        return aiToDoListRepository.findByUserId(user.getId());
    }
}
