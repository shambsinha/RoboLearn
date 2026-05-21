package com.robolearn.api.repository;

import com.robolearn.api.document.CodeSubmission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodeSubmissionRepository extends MongoRepository<CodeSubmission, String> {
    List<CodeSubmission> findByUserId(Long userId);
    List<CodeSubmission> findByProblemId(Long problemId);
    List<CodeSubmission> findByUserIdAndProblemIdOrderBySubmittedAtDesc(Long userId, Long problemId);
    
    long deleteByProblemId(Long problemId);
    
    long countByProblemIdAndStatus(Long problemId, String status);
    long countByProblemIdAndStatusAndExecutionTimeMsGreaterThan(Long problemId, String status, Double executionTimeMs);
    long countByProblemIdAndStatusAndMemoryUsageMbGreaterThan(Long problemId, String status, Double memoryUsageMb);
}
