package com.robolearn.ai.service;

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

public interface AiAgentService {
    AiToDoList generateLearningPath(String userEmail, AiPathRequest request);

    String chat(String message);

    List<AiToDoList> getUserPaths(String userEmail);
}
