package com.robolearn.api.service;

import com.robolearn.api.document.CodeSubmission;
import com.robolearn.api.dto.request.UpdateProfileRequest;
import com.robolearn.api.dto.response.UserProfileResponse;
import com.robolearn.api.entity.User;
import com.robolearn.api.repository.CodeSubmissionRepository;
import com.robolearn.api.repository.CodingProblemRepository;
import com.robolearn.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CodeSubmissionRepository codeSubmissionRepository;
    private final CodingProblemRepository codingProblemRepository;

    public UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        long rank = userRepository.countByXpGreaterThan(user.getXp()) + 1;

        // Dynamically compute historical activity from MongoDB for accuracy
        List<CodeSubmission> submissions = codeSubmissionRepository.findByUserId(user.getId());
        
        Set<String> attemptedDates = submissions.stream()
                .filter(sub -> sub.getSubmittedAt() != null)
                .map(sub -> sub.getSubmittedAt().format(DateTimeFormatter.ISO_LOCAL_DATE))
                .collect(Collectors.toSet());

        Set<String> streakDates = submissions.stream()
                .filter(sub -> sub.getSubmittedAt() != null && "PASS".equals(sub.getStatus()))
                .map(sub -> sub.getSubmittedAt().format(DateTimeFormatter.ISO_LOCAL_DATE))
                .collect(Collectors.toSet());

        // Sync old Postgres streak dates if they exist just in case
        if (user.getStreakDates() != null) {
            streakDates.addAll(user.getStreakDates());
        }

        // Get total system problem counts
        long totalProblems = codingProblemRepository.count();
        long totalEasy = codingProblemRepository.countByDifficultyIgnoreCase("EASY");
        long totalMedium = codingProblemRepository.countByDifficultyIgnoreCase("MEDIUM");
        long totalHard = codingProblemRepository.countByDifficultyIgnoreCase("HARD");

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .profilePictureUrl(user.getProfilePictureUrl())
                .bio(user.getBio())
                .githubUrl(user.getGithubUrl())
                .linkedinUrl(user.getLinkedinUrl())
                .portfolioUrl(user.getPortfolioUrl())
                .onboardingStatus(user.getOnboardingStatus())
                .xp(user.getXp())
                .rank(rank)
                .totalSolved(user.getSolvedProblemIds().size())
                .solvedEasy(user.getSolvedEasy())
                .solvedMedium(user.getSolvedMedium())
                .solvedHard(user.getSolvedHard())
                .totalSystemProblems(totalProblems)
                .totalSystemEasy(totalEasy)
                .totalSystemMedium(totalMedium)
                .totalSystemHard(totalHard)
                .streakDates(streakDates)
                .attemptedDates(attemptedDates)
                .joinedAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (request.getProfilePictureUrl() != null) {
            if (request.getProfilePictureUrl().isEmpty()) {
                user.setProfilePictureUrl(null);
            } else {
                user.setProfilePictureUrl(request.getProfilePictureUrl());
            }
        }
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getGithubUrl() != null) user.setGithubUrl(request.getGithubUrl());
        if (request.getLinkedinUrl() != null) user.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getPortfolioUrl() != null) user.setPortfolioUrl(request.getPortfolioUrl());
        if (request.getOnboardingStatus() != null) user.setOnboardingStatus(request.getOnboardingStatus());

        userRepository.save(user);
        return getUserProfile(email);
    }
}
