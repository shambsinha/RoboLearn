package com.robolearn.api.controller;

import com.robolearn.api.repository.UserRepository;
import com.robolearn.api.repository.CourseRepository;
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
public class HealthController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        
        try {
            status.put("postgresql_count", userRepository.count());
            status.put("mongodb_count", courseRepository.count());
            status.put("database", "CONNECTED");
        } catch (Exception e) {
            status.put("database", "ERROR: " + e.getMessage());
            status.put("status", "DEGRADED");
        }
        
        return ResponseEntity.ok(status);
    }
}
