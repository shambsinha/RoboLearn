package com.robolearn.api.repository;

import com.robolearn.api.entity.TestCase;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestCaseRepository extends MongoRepository<TestCase, Long> {
}
