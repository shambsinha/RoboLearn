package com.robolearn.api.service;

import com.robolearn.api.dto.response.AdminUserResponse;
import com.robolearn.api.entity.User;
import com.robolearn.api.entity.UserRole;
import com.robolearn.api.exception.ResourceNotFoundException;
import com.robolearn.api.repository.CodeSubmissionRepository;
import com.robolearn.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final CodeSubmissionRepository submissionRepository;
    private final com.robolearn.api.repository.UserSolutionRepository userSolutionRepository;

    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.STUDENT)
                .map(this::mapToAdminUserResponse)
                .collect(Collectors.toList());
    }

    public AdminUserResponse toggleSuspendStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        user.setSuspended(!user.isSuspended());
        return mapToAdminUserResponse(userRepository.save(user));
    }

    public AdminUserResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToAdminUserResponse(user);
    }

    private AdminUserResponse mapToAdminUserResponse(User user) {
        // High-level low-latency approach: Use indexed relational database for counts
        long problemsSolved = userSolutionRepository.countByUserId(user.getId());

        long enrolledCount = user.getEnrolledCourseIds() != null ? user.getEnrolledCourseIds().size() : 0;
        
        // Use actual XP from user record
        int xp = user.getXp();
        int streak = (int) (problemsSolved % 10);
        int progress = (int) Math.min(100, (problemsSolved * 5) + (enrolledCount * 10));

        return AdminUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .joinedAt(user.getCreatedAt())
                .isSuspended(user.isSuspended())
                .progressPercentage(progress)
                .coursesEnrolled(enrolledCount)
                .problemsSolved(problemsSolved)
                .xpPoints(xp)
                .dailyStreak(streak)
                .build();
    }
}
