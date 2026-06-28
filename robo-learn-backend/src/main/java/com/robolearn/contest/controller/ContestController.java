package com.robolearn.contest.controller;

import com.robolearn.contest.dto.ContestRequest;
import com.robolearn.contest.dto.ContestResponse;
import com.robolearn.contest.service.ContestService;
import com.robolearn.user.entity.User;
import com.robolearn.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/contests")
@lombok.extern.slf4j.Slf4j
public class ContestController {

    private final ContestService contestService;
    private final UserService userService;

    public ContestController(ContestService contestService, UserService userService) {
        this.contestService = contestService;
        this.userService = userService;
    }

    private Long getUserId(Principal principal) {
        if (principal == null) return null;
        User user = userService.getUserByEmail(principal.getName());
        return user != null ? user.getId() : null;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('COURSE_CREATE', 'ADMIN')")
    public ResponseEntity<ContestResponse> createContest(
            @RequestBody ContestRequest request,
            Principal principal) {
        log.info("Executing createContest");
        Long userId = getUserId(principal);
        ContestResponse response = contestService.createContest(request, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ContestResponse>> getAllContests(Principal principal) {
        log.info("Executing getAllContests");
        Long userId = getUserId(principal);
        List<ContestResponse> responses = contestService.getAllContests(userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContestResponse> getContestById(
            @PathVariable String id,
            Principal principal) {
        log.info("Executing getContestById with id={}", id);
        Long userId = getUserId(principal);
        ContestResponse response = contestService.getContestById(id, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/enroll")
    public ResponseEntity<ContestResponse> enrollInContest(
            @PathVariable String id,
            Principal principal) {
        log.info("Executing enrollInContest with id={}", id);
        Long userId = getUserId(principal);
        ContestResponse response = contestService.enroll(id, userId);
        return ResponseEntity.ok(response);
    }
}
