package com.robolearn.course.service;

import com.robolearn.course.repository.UserCurriculumProgressRepository;
import com.robolearn.core.service.CloudinaryService;
import com.robolearn.dashboard.service.DashboardService;
import com.robolearn.course.entity.UserCurriculumProgress;
import com.robolearn.course.dto.request.CourseRequest;
import com.robolearn.course.dto.request.CurriculumItemRequest;
import com.robolearn.course.dto.request.ModuleRequest;
import com.robolearn.course.dto.response.CourseResponse;
import com.robolearn.course.dto.response.CurriculumItemResponse;
import com.robolearn.course.dto.response.ModuleResponse;
import com.robolearn.course.entity.Course;
import com.robolearn.course.entity.Module;
import com.robolearn.user.entity.User;
import com.robolearn.problem.entity.CodingProblem;
import com.robolearn.core.exception.ResourceNotFoundException;
import com.robolearn.course.repository.CourseRepository;
import com.robolearn.user.repository.UserRepository;
import com.robolearn.problem.repository.CodingProblemRepository;
import com.robolearn.auth.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

public interface CourseService {
    CourseResponse createCourse(CourseRequest request);

    CourseResponse updateCourse(String courseId, CourseRequest request);

    void deleteCourse(String courseId);

    ModuleResponse addModule(String courseId, ModuleRequest request);

    void deleteModule(String moduleId);

    List<CourseResponse> getAllCourses();

    CourseResponse getCourseById(String courseId);

    void addProblemToCourse(String courseId, Long problemId);

    void removeProblemFromCourse(String courseId, Long problemId);

    List<CodingProblem> getCourseProblems(String courseId);

    void enrollInCourse(String email, String courseId);

    List<CourseResponse> getEnrolledCourses(String email);

    void markItemComplete(String email, String courseId, String moduleId, Integer itemOrder, String type);

    void markProblemComplete(Long userId, String courseId, String moduleId, Integer itemOrder);

    java.util.Set<String> getUserCourseProgress(String email, String courseId);

    ModuleResponse updateModuleItems(String moduleId, List<CurriculumItemRequest> requests);
}
