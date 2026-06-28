package com.robolearn.contest.repository;

import com.robolearn.contest.entity.Contest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContestRepository extends MongoRepository<Contest, String> {
    List<Contest> findByCreatedBy(Long createdBy);
}
