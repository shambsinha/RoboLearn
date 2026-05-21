package com.robolearn.api.controller;

import com.robolearn.api.dto.request.UpdateProfileRequest;
import com.robolearn.api.dto.response.UserProfileResponse;
import com.robolearn.api.service.UserService;
import com.robolearn.api.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CloudinaryService cloudinaryService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getUserProfile(userDetails.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getUsername(), request));
    }

    @PutMapping("/profile/image")
    public ResponseEntity<UserProfileResponse> uploadProfileImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("image") MultipartFile file) {
        try {
            // Get current profile to check if there is an existing image
            UserProfileResponse currentProfile = userService.getUserProfile(userDetails.getUsername());
            if (currentProfile.getProfilePictureUrl() != null && !currentProfile.getProfilePictureUrl().isEmpty()) {
                cloudinaryService.deleteImageByUrl(currentProfile.getProfilePictureUrl());
            }

            String imageUrl = cloudinaryService.uploadImage(file);
            UpdateProfileRequest updateRequest = new UpdateProfileRequest();
            updateRequest.setProfilePictureUrl(imageUrl);
            return ResponseEntity.ok(userService.updateProfile(userDetails.getUsername(), updateRequest));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/profile/image")
    public ResponseEntity<UserProfileResponse> deleteProfileImage(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserProfileResponse currentProfile = userService.getUserProfile(userDetails.getUsername());
        if (currentProfile.getProfilePictureUrl() != null && !currentProfile.getProfilePictureUrl().isEmpty()) {
            cloudinaryService.deleteImageByUrl(currentProfile.getProfilePictureUrl());
            UpdateProfileRequest updateRequest = new UpdateProfileRequest();
            updateRequest.setProfilePictureUrl(""); // Use empty string to indicate removal (or handle null carefully in service)
            // UserService's updateProfile ignores null fields, so we might need a specific method or handle empty string.
            // Let's pass empty string. If UserService skips nulls, we'll need to check if it handles empty string.
            return ResponseEntity.ok(userService.updateProfile(userDetails.getUsername(), updateRequest));
        }
        return ResponseEntity.ok(currentProfile);
    }
}
