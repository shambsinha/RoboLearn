package com.robolearn.course.repository;

import com.robolearn.course.entity.UserCurriculumProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCurriculumProgressRepository extends JpaRepository<UserCurriculumProgress, Long> {
    List<UserCurriculumProgress> findByUserIdAndCourseId(Long userId, String courseId);
    Optional<UserCurriculumProgress> findByUserIdAndCourseIdAndModuleIdAndItemOrder(Long userId, String courseId, String moduleId, Integer itemOrder);
    boolean existsByUserIdAndCourseIdAndModuleIdAndItemOrder(Long userId, String courseId, String moduleId, Integer itemOrder);
}
