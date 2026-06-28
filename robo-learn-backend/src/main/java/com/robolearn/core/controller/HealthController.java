package com.robolearn.core.controller;

import com.robolearn.user.repository.UserRepository;
import com.robolearn.course.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public/health")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class HealthController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        log.info("Executing checkHealth");
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("timestamp", System.currentTimeMillis());
        
        try {
            // Internal connectivity check only
            userRepository.count();
            status.put("database", "CONNECTED");
        } catch (Exception e) {
            status.put("database", "ERROR");
            status.put("status", "DEGRADED");
        }
        
        return ResponseEntity.ok(status);
    }
}
