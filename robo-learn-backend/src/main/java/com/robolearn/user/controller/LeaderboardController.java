package com.robolearn.user.controller;

import com.robolearn.user.dto.response.LeaderboardResponse;
import com.robolearn.user.entity.User;
import com.robolearn.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<LeaderboardResponse>> getLeaderboard() {
        List<User> topUsers = userRepository.findTop20ByOrderByXpDesc();
        
        AtomicInteger rank = new AtomicInteger(1);
        List<LeaderboardResponse> leaderboard = topUsers.stream()
                .filter(u -> u.getRoles().stream().noneMatch(r -> r.getName().equals("ADMIN"))) // Exclude Admins from leaderboard
                .map(u -> LeaderboardResponse.builder()
                        .username(u.getUsername())
                        .xp(u.getXp())
                        .profilePictureUrl(u.getProfilePictureUrl())
                        .solvedEasy(u.getSolvedEasy())
                        .solvedMedium(u.getSolvedMedium())
                        .solvedHard(u.getSolvedHard())
                        .rank(rank.getAndIncrement())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(leaderboard);
    }
}
