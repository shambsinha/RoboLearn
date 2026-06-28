package com.robolearn.user.controller;

import com.robolearn.auth.dto.request.ChangePasswordRequest;
import com.robolearn.auth.dto.request.SetPasswordRequest;
import com.robolearn.user.dto.request.UpdateProfileRequest;
import com.robolearn.user.dto.response.UserProfileResponse;
import com.robolearn.user.service.UserService;
import com.robolearn.core.service.CloudinaryService;
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
@lombok.extern.slf4j.Slf4j
public class UserController {

    private final UserService userService;
    private final CloudinaryService cloudinaryService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("Executing getProfile with userDetails={}", userDetails);
        return ResponseEntity.ok(userService.getUserProfile(userDetails.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest request) {
        log.info("Executing updateProfile with userDetails={}", userDetails);
        return ResponseEntity.ok(userService.updateProfile(userDetails.getUsername(), request));
    }

    @PostMapping("/profile/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChangePasswordRequest request) {
        log.info("Executing changePassword with userDetails={}", userDetails);
        try {
            userService.changePassword(userDetails.getUsername(), request);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/profile/request-set-password-otp")
    public ResponseEntity<?> requestSetPasswordOtp(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("Executing requestSetPasswordOtp with userDetails={}", userDetails);
        userService.requestProfileOtp(userDetails.getUsername());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/profile/set-password")
    public ResponseEntity<?> setPassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody SetPasswordRequest request) {
        log.info("Executing setPassword with userDetails={}", userDetails);
        try {
            userService.setPassword(userDetails.getUsername(), request);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/profile/image")
    public ResponseEntity<UserProfileResponse> uploadProfileImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("image") MultipartFile file) {
        log.info("Executing uploadProfileImage with userDetails={}", userDetails);
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
        log.info("Executing deleteProfileImage with userDetails={}", userDetails);
        UserProfileResponse currentProfile = userService.getUserProfile(userDetails.getUsername());
        if (currentProfile.getProfilePictureUrl() != null && !currentProfile.getProfilePictureUrl().isEmpty()) {
            cloudinaryService.deleteImageByUrl(currentProfile.getProfilePictureUrl());
            UpdateProfileRequest updateRequest = new UpdateProfileRequest();
            updateRequest.setProfilePictureUrl(""); // Use empty string to indicate removal (or handle null carefully in service)
            return ResponseEntity.ok(userService.updateProfile(userDetails.getUsername(), updateRequest));
        }
        return ResponseEntity.ok(currentProfile);
    }
}
