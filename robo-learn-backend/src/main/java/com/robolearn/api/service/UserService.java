package com.robolearn.api.service;

import com.robolearn.api.dto.request.UpdateProfileRequest;
import com.robolearn.api.dto.response.AdminUserResponse;
import com.robolearn.api.dto.response.UserProfileResponse;
import com.robolearn.api.entity.User;
import com.robolearn.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import com.robolearn.api.dto.request.ChangePasswordRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import com.robolearn.api.dto.request.SetPasswordRequest;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DashboardService dashboardService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    public void requestProfileOtp(String email) {
        emailService.sendOtp(email);
    }

    public void setPassword(String email, SetPasswordRequest request) {
        if (!emailService.verifyOtp(email, request.getOtp())) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }
        
        User user = getUserByEmail(email);
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getUserByEmail(email);
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Incorrect current password");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void enrollInCourse(String email, String courseId) {
        dashboardService.evictStudentMetrics(email);
        dashboardService.evictAdminMetrics();
        User user = getUserByEmail(email);
        user.getEnrolledCourseIds().add(courseId);
        userRepository.save(user);
    }

    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToAdminUserResponse)
                .collect(Collectors.toList());
    }

    public UserProfileResponse getUserProfile(String email) {
        User user = getUserByEmail(email);
        return mapToUserProfileResponse(user);
    }

    private AdminUserResponse mapToAdminUserResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .isSuspended(user.isSuspended())
                .xpPoints(user.getXp())
                .joinedAt(user.getCreatedAt())
                .coursesEnrolled(user.getEnrolledCourseIds().size())
                .problemsSolved(user.getSolvedProblemIds().size())
                .build();
    }

    private UserProfileResponse mapToUserProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .authProvider(user.getAuthProvider())
                .xp(user.getXp())
                .bio(user.getBio())
                .githubUrl(user.getGithubUrl())
                .linkedinUrl(user.getLinkedinUrl())
                .portfolioUrl(user.getPortfolioUrl())
                .profilePictureUrl(user.getProfilePictureUrl())
                .enrolledCourseIds(user.getEnrolledCourseIds())
                .solvedProblemIds(user.getSolvedProblemIds())
                .solvedEasy(user.getSolvedEasy())
                .solvedMedium(user.getSolvedMedium())
                .solvedHard(user.getSolvedHard())
                .joinedAt(user.getCreatedAt())
                .build();
    }

    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        dashboardService.evictAdminMetrics();
        User user = getUserByEmail(email);
        
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new IllegalArgumentException("Username is already taken");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getGithubUrl() != null) user.setGithubUrl(request.getGithubUrl());
        if (request.getLinkedinUrl() != null) user.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getPortfolioUrl() != null) user.setPortfolioUrl(request.getPortfolioUrl());
        if (request.getProfilePictureUrl() != null) user.setProfilePictureUrl(request.getProfilePictureUrl());
        
        return mapToUserProfileResponse(userRepository.save(user));
    }
}
