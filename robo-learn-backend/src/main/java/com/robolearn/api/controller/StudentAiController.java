package com.robolearn.api.controller;

import com.robolearn.api.document.AiToDoList;
import com.robolearn.api.dto.request.AiPathRequest;
import com.robolearn.api.service.AiAgentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/ai")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
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
}
