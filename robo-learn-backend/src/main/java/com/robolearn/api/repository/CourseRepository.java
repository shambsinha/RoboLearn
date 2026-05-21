package com.robolearn.api.repository;

import com.robolearn.api.entity.Course;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends MongoRepository<Course, String> {
    List<Course> findByInstructorId(Long instructorId);
    List<Course> findByTitleContainingIgnoreCase(String title);
    Optional<Course> findByTitle(String title);
    
    @org.springframework.data.mongodb.repository.Query("{'modules.items.contentPayload': ?0}")
    List<Course> findByProblemIdInCurriculum(String problemId);
}
