package com.robolearn.contest.service;

import com.robolearn.contest.dto.ContestRequest;
import com.robolearn.contest.dto.ContestResponse;
import com.robolearn.contest.entity.Contest;
import com.robolearn.contest.repository.ContestRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContestService {
    
    private final ContestRepository contestRepository;

    public ContestService(ContestRepository contestRepository) {
        this.contestRepository = contestRepository;
    }

    public ContestResponse createContest(ContestRequest request, Long createdBy) {
        Contest contest = Contest.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .createdBy(createdBy)
                .problemIds(request.getProblemIds() != null ? request.getProblemIds() : List.of())
                .build();
        
        Contest saved = contestRepository.save(contest);
        return mapToResponse(saved, createdBy);
    }

    public List<ContestResponse> getAllContests(Long userId) {
        return contestRepository.findAll().stream()
                .map(c -> mapToResponse(c, userId))
                .collect(Collectors.toList());
    }

    public ContestResponse getContestById(String contestId, Long userId) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Contest not found"));
        return mapToResponse(contest, userId);
    }

    public ContestResponse enroll(String contestId, Long userId) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new RuntimeException("Contest not found"));
        
        contest.getEnrolledUserIds().add(userId);
        contest = contestRepository.save(contest);
        return mapToResponse(contest, userId);
    }

    private ContestResponse mapToResponse(Contest contest, Long userId) {
        boolean isEnrolled = contest.getEnrolledUserIds() != null && contest.getEnrolledUserIds().contains(userId);
        int enrolledCount = contest.getEnrolledUserIds() != null ? contest.getEnrolledUserIds().size() : 0;
        
        return ContestResponse.builder()
                .id(contest.getId())
                .title(contest.getTitle())
                .description(contest.getDescription())
                .startTime(contest.getStartTime())
                .endTime(contest.getEndTime())
                .createdBy(contest.getCreatedBy())
                .problemIds(contest.getProblemIds())
                .enrolledCount(enrolledCount)
                .isEnrolled(isEnrolled)
                .build();
    }
}
