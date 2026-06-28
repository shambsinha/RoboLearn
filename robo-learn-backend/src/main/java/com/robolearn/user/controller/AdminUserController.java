package com.robolearn.user.controller;

import com.robolearn.user.dto.response.AdminUserResponse;
import com.robolearn.user.dto.response.UserProfileResponse;
import com.robolearn.user.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('USER_MANAGE')")
@lombok.extern.slf4j.Slf4j
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        log.info("Executing getAllUsers");
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long userId) {
        log.info("Executing getUserProfile with userId={}", userId);
        return ResponseEntity.ok(adminUserService.getUserProfile(userId));
    }

    @PutMapping("/{userId}/suspend")
    public ResponseEntity<AdminUserResponse> toggleSuspendStatus(@PathVariable Long userId) {
        log.info("Executing toggleSuspendStatus with userId={}", userId);
        return ResponseEntity.ok(adminUserService.toggleSuspendStatus(userId));
    }
}
