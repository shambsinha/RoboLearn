package com.robolearn.problem.repository;

import com.robolearn.problem.entity.CodingProblem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CodingProblemRepository extends MongoRepository<CodingProblem, Long> {
    List<CodingProblem> findByCourseId(String courseId);
    List<CodingProblem> findByDifficulty(String difficulty);
    Optional<CodingProblem> findTopByOrderByIdDesc();
    
    long count();
    long countByDifficultyIgnoreCase(String difficulty);
}
