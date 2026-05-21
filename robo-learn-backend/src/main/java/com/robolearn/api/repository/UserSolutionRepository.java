package com.robolearn.api.repository;

import com.robolearn.api.entity.UserSolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSolutionRepository extends JpaRepository<UserSolution, Long> {
    List<UserSolution> findByUserId(Long userId);
    Optional<UserSolution> findByUserIdAndProblemId(Long userId, Long problemId);
    boolean existsByUserIdAndProblemId(Long userId, Long problemId);
    long countByUserId(Long userId);
}
