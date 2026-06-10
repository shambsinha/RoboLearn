package com.robolearn.api.controller;

import com.robolearn.api.dto.response.AdminUserResponse;
import com.robolearn.api.dto.response.UserProfileResponse;
import com.robolearn.api.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(adminUserService.getUserProfile(userId));
    }

    @PutMapping("/{userId}/suspend")
    public ResponseEntity<AdminUserResponse> toggleSuspendStatus(@PathVariable Long userId) {
        return ResponseEntity.ok(adminUserService.toggleSuspendStatus(userId));
    }
}
