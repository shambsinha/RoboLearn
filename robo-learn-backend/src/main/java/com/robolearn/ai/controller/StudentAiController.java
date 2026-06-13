package com.robolearn.ai.controller;

import com.robolearn.ai.entity.AiToDoList;
import com.robolearn.ai.dto.request.AiPathRequest;
import com.robolearn.ai.service.AiAgentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student/ai")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_STUDENT')")
public class StudentAiController {

    private final AiAgentService aiAgentService;

    @PostMapping("/path")
    public ResponseEntity<AiToDoList> generatePath(@Valid @RequestBody AiPathRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(aiAgentService.generateLearningPath(email, request));
    }

    @GetMapping("/paths")
    public ResponseEntity<List<AiToDoList>> getMyPaths() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(aiAgentService.getUserPaths(email));
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String response = aiAgentService.chat(request.get("message"));
        return ResponseEntity.ok(Map.of("response", response));
    }
}
