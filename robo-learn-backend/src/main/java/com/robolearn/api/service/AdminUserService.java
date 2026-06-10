package com.robolearn.api.service;

import com.robolearn.api.dto.response.AdminUserResponse;
import com.robolearn.api.dto.response.UserProfileResponse;
import com.robolearn.api.entity.User;
import com.robolearn.api.repository.UserRepository;
import com.robolearn.api.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToAdminUserResponse)
                .collect(Collectors.toList());
    }

    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        return mapToUserProfileResponse(user);
    }

    public AdminUserResponse toggleSuspendStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
        user.setSuspended(!user.isSuspended());
        return mapToAdminUserResponse(userRepository.save(user));
    }

    private AdminUserResponse mapToAdminUserResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .joinedAt(user.getCreatedAt())
                .isSuspended(user.isSuspended())
                .xpPoints(user.getXp())
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
                .build();
    }
}
