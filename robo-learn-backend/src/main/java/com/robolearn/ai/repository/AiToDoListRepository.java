package com.robolearn.ai.repository;

import com.robolearn.ai.entity.AiToDoList;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiToDoListRepository extends MongoRepository<AiToDoList, String> {
    List<AiToDoList> findByUserId(Long userId);
    List<AiToDoList> findByUserIdAndCompleted(Long userId, boolean completed);
}
