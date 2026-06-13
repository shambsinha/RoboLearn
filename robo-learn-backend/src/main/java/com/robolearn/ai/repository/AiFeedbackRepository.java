package com.robolearn.ai.repository;

import com.robolearn.ai.entity.AiFeedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AiFeedbackRepository extends MongoRepository<AiFeedback, String> {
    Optional<AiFeedback> findBySubmissionId(String submissionId);
}
