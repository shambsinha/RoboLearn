package com.robolearn.api.service;

import com.robolearn.api.dto.request.CourseRequest;
import com.robolearn.api.dto.request.CurriculumItemRequest;
import com.robolearn.api.dto.request.ModuleRequest;
import com.robolearn.api.dto.response.CourseResponse;
import com.robolearn.api.dto.response.CurriculumItemResponse;
import com.robolearn.api.dto.response.ModuleResponse;
import com.robolearn.api.entity.Course;
import com.robolearn.api.entity.Module;
import com.robolearn.api.entity.User;
import com.robolearn.api.entity.CodingProblem;
import com.robolearn.api.exception.ResourceNotFoundException;
import com.robolearn.api.repository.CourseRepository;
import com.robolearn.api.repository.UserRepository;
import com.robolearn.api.repository.CodingProblemRepository;
import com.robolearn.api.security.CustomUserDetails;
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

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CodingProblemRepository codingProblemRepository;
    private final com.robolearn.api.repository.UserCurriculumProgressRepository progressRepository;
    private final CloudinaryService cloudinaryService;
    private final DashboardService dashboardService;

    private String generateId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    @CacheEvict(value = "courses", allEntries = true)
    public CourseResponse createCourse(CourseRequest request) {
        dashboardService.evictAdminMetrics();
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User instructor = userDetails.getUser();

        courseRepository.findByTitle(request.getTitle()).ifPresent(existing -> {
            throw new RuntimeException("A course with this title already exists");
        });

        Course course = Course.builder()
                .courseId(generateId())
                .title(request.getTitle())
                .description(request.getDescription())
                .level(request.getLevel())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .tags(request.getTags() != null ? request.getTags() : new java.util.ArrayList<>())
                .instructorId(instructor.getId())
                .modules(new java.util.ArrayList<>())
                .problemIds(new java.util.ArrayList<>())
                .build();

        return mapToCourseResponse(courseRepository.save(course));
    }

    @Caching(evict = {
        @CacheEvict(value = "courses", allEntries = true),
        @CacheEvict(value = "courseDetails", key = "#courseId")
    })
    public CourseResponse updateCourse(String courseId, CourseRequest request) {
        dashboardService.evictAdminMetrics();
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        courseRepository.findByTitle(request.getTitle()).ifPresent(existing -> {
            if (!existing.getCourseId().equals(courseId)) {
                throw new RuntimeException("A course with this title already exists");
            }
        });

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setLevel(request.getLevel());
        course.setCategory(request.getCategory());
        course.setImageUrl(request.getImageUrl());
        course.setTags(request.getTags() != null ? request.getTags() : new java.util.ArrayList<>());

        return mapToCourseResponseLight(courseRepository.save(course));
    }

    @Caching(evict = {
        @CacheEvict(value = "courses", allEntries = true),
        @CacheEvict(value = "courseDetails", key = "#courseId")
    })
    public void deleteCourse(String courseId) {
        dashboardService.evictAdminMetrics();
        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course not found");
        }
        courseRepository.deleteById(courseId);
    }

    @CacheEvict(value = "courseDetails", key = "#courseId")
    public ModuleResponse addModule(String courseId, ModuleRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (course.getModules() == null) {
            course.setModules(new java.util.ArrayList<>());
        }

        Module module = Module.builder()
                .moduleId(generateId())
                .title(request.getTitle())
                .serialOrder(request.getSerialOrder())
                .items(new java.util.ArrayList<>())
                .build();
        
        course.getModules().add(module);
        courseRepository.save(course);

        return mapToModuleResponse(module);
    }

    @CacheEvict(value = "courseDetails", allEntries = true) 
    public void deleteModule(String moduleId) {
        List<Course> courses = courseRepository.findAll();
        for (Course course : courses) {
            if (course.getModules() != null) {
                boolean removed = course.getModules().removeIf(m -> m.getModuleId().equals(moduleId));
                if (removed) {
                    courseRepository.save(course);
                    return;
                }
            }
        }
        throw new ResourceNotFoundException("Module not found");
    }

    @Cacheable(value = "courses")
    public List<CourseResponse> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        return mapToCourseResponseList(courses);
    }

    @Cacheable(value = "courseDetails", key = "#courseId")
    public CourseResponse getCourseById(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));
        return mapToCourseResponse(course);
    }

    @CacheEvict(value = "courseDetails", key = "#courseId")
    public void addProblemToCourse(String courseId, Long problemId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        if (!codingProblemRepository.existsById(problemId)) {
            throw new ResourceNotFoundException("Problem not found");
        }
        
        if (course.getProblemIds() == null) {
            course.setProblemIds(new java.util.ArrayList<>());
        }
        
        if (!course.getProblemIds().contains(problemId)) {
            course.getProblemIds().add(problemId);
            courseRepository.save(course);
        }
    }

    @CacheEvict(value = "courseDetails", key = "#courseId")
    public void removeProblemFromCourse(String courseId, Long problemId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        if (course.getProblemIds() != null) {
            course.getProblemIds().remove(problemId);
            courseRepository.save(course);
        }
    }

    public List<CodingProblem> getCourseProblems(String courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        
        if (course.getProblemIds() == null || course.getProblemIds().isEmpty()) {
            return new java.util.ArrayList<>();
        }
        
        return codingProblemRepository.findAllById(course.getProblemIds());
    }

    @Caching(evict = {
        @CacheEvict(value = "enrolledCourses", key = "#email"),
        @CacheEvict(value = "studentDashboard", key = "#email")
    })
    public void enrollInCourse(String email, String courseId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!courseRepository.existsById(courseId)) {
            throw new ResourceNotFoundException("Course not found with ID: " + courseId);
        }

        if (user.getEnrolledCourseIds() == null) {
            user.setEnrolledCourseIds(new java.util.HashSet<>());
        }
        user.getEnrolledCourseIds().add(courseId);
        userRepository.save(user);
        dashboardService.evictAdminMetrics();
    }

    @Cacheable(value = "enrolledCourses", key = "#email")
    public List<CourseResponse> getEnrolledCourses(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getEnrolledCourseIds() == null || user.getEnrolledCourseIds().isEmpty()) {
            return new java.util.ArrayList<>();
        }

        List<Course> courses = courseRepository.findAllById(user.getEnrolledCourseIds());
        return mapToCourseResponseList(courses);
    }

    private List<CourseResponse> mapToCourseResponseList(List<Course> courses) {
        java.util.Set<Long> instructorIds = courses.stream()
                .map(Course::getInstructorId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());

        java.util.Map<Long, String> instructorNames = userRepository.findAllById(instructorIds).stream()
                .collect(Collectors.toMap(User::getId, User::getUsername));

        return courses.stream()
                .map(c -> {
                    String instructorName = instructorNames.getOrDefault(c.getInstructorId(), "Academy Instructor");
                    return mapToCourseResponseLightWithInstructor(c, instructorName);
                })
                .collect(Collectors.toList());
    }

    private CourseResponse mapToCourseResponseLightWithInstructor(Course course, String instructorName) {
        return CourseResponse.builder()
                .courseId(course.getCourseId())
                .title(course.getTitle())
                .description(course.getDescription())
                .difficulty(course.getLevel())
                .level(course.getLevel())
                .category(course.getCategory() != null ? course.getCategory() : "General")
                .imageUrl(course.getImageUrl())
                .tags(course.getTags() != null ? course.getTags() : new java.util.ArrayList<>())
                .instructorName(instructorName)
                .createdAt(course.getCreatedAt())
                .build();
    }

    @CacheEvict(value = "courseProgress", key = "#courseId + '-' + #email")
    public void markItemComplete(String email, String courseId, String moduleId, Integer itemOrder, String type) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Long userId = user.getId();

        if ("PROBLEM".equalsIgnoreCase(type)) {
            throw new RuntimeException("Problems must be completed by submitting correct code.");
        }

        if (!progressRepository.existsByUserIdAndCourseIdAndModuleIdAndItemOrder(userId, courseId, moduleId, itemOrder)) {
            com.robolearn.api.entity.UserCurriculumProgress progress = com.robolearn.api.entity.UserCurriculumProgress.builder()
                    .userId(userId)
                    .courseId(courseId)
                    .moduleId(moduleId)
                    .itemOrder(itemOrder)
                    .type(type.toUpperCase())
                    .isCompleted(true)
                    .build();
            progressRepository.save(progress);
        }
    }

    @CacheEvict(value = "courseProgress", allEntries = true) 
    public void markProblemComplete(Long userId, String courseId, String moduleId, Integer itemOrder) {
        if (!progressRepository.existsByUserIdAndCourseIdAndModuleIdAndItemOrder(userId, courseId, moduleId, itemOrder)) {
            com.robolearn.api.entity.UserCurriculumProgress progress = com.robolearn.api.entity.UserCurriculumProgress.builder()
                    .userId(userId)
                    .courseId(courseId)
                    .moduleId(moduleId)
                    .itemOrder(itemOrder)
                    .type("PROBLEM")
                    .isCompleted(true)
                    .build();
            progressRepository.save(progress);
        }
    }

    @Cacheable(value = "courseProgress", key = "#courseId + '-' + #email")
    public java.util.Set<String> getUserCourseProgress(String email, String courseId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Long userId = user.getId();

        return progressRepository.findByUserIdAndCourseId(userId, courseId).stream()
                .map(p -> p.getModuleId() + "-" + p.getItemOrder())
                .collect(Collectors.toSet());
    }

    public ModuleResponse updateModuleItems(String moduleId, List<CurriculumItemRequest> requests) {
        List<Course> courses = courseRepository.findAll();
        for (Course course : courses) {
            if (course.getModules() == null) continue;
            for (Module module : course.getModules()) {
                if (module.getModuleId().equals(moduleId)) {
                    java.util.Set<String> oldImageUrls = extractImageUrls(module.getItems());

                    List<Module.CurriculumItem> items = requests.stream()
                            .map(req -> Module.CurriculumItem.builder()
                                    .order(req.getOrder())
                                    .type(req.getType())
                                    .contentPayload(req.getContentPayload())
                                    .title(req.getTitle())
                                    .build())
                            .collect(Collectors.toList());

                    java.util.Set<String> newImageUrls = extractImageUrls(items);

                    for (String oldUrl : oldImageUrls) {
                        if (!newImageUrls.contains(oldUrl)) {
                            cloudinaryService.deleteImageByUrl(oldUrl);
                        }
                    }

                    module.setItems(items);
                    courseRepository.save(course);
                    return mapToModuleResponse(module);
                }
            }
        }
        throw new ResourceNotFoundException("Module not found");
    }

    private java.util.Set<String> extractImageUrls(List<Module.CurriculumItem> items) {
        java.util.Set<String> urls = new java.util.HashSet<>();
        if (items == null) return urls;
        
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("<img[^>]+src\\s*=\\s*['\"]([^'\"]+)['\"][^>]*>");
        for (Module.CurriculumItem item : items) {
            if ("THEORY".equalsIgnoreCase(item.getType()) && item.getContentPayload() != null) {
                java.util.regex.Matcher matcher = pattern.matcher(item.getContentPayload());
                while (matcher.find()) {
                    urls.add(matcher.group(1));
                }
            }
        }
        return urls;
    }

    private CourseResponse mapToCourseResponse(Course course) {
        String instructorName = "Academy Instructor";
        if (course.getInstructorId() != null) {
            instructorName = userRepository.findById(course.getInstructorId())
                    .map(User::getUsername)
                    .orElse("Academy Instructor");
        }

        List<ModuleResponse> modules = course.getModules() != null ? course.getModules().stream()
                .map(this::mapToModuleResponse)
                .collect(Collectors.toList()) : new java.util.ArrayList<>();

        return CourseResponse.builder()
                .courseId(course.getCourseId())
                .title(course.getTitle())
                .description(course.getDescription())
                .difficulty(course.getLevel())
                .level(course.getLevel())
                .category(course.getCategory() != null ? course.getCategory() : "General")
                .imageUrl(course.getImageUrl())
                .tags(course.getTags() != null ? course.getTags() : new java.util.ArrayList<>())
                .instructorName(instructorName)
                .createdAt(course.getCreatedAt())
                .modules(modules)
                .build();
    }

    private CourseResponse mapToCourseResponseLight(Course course) {
        String instructorName = "Academy Instructor";
        if (course.getInstructorId() != null) {
            instructorName = userRepository.findById(course.getInstructorId())
                    .map(User::getUsername)
                    .orElse("Academy Instructor");
        }

        return CourseResponse.builder()
                .courseId(course.getCourseId())
                .title(course.getTitle())
                .description(course.getDescription())
                .difficulty(course.getLevel())
                .level(course.getLevel())
                .category(course.getCategory() != null ? course.getCategory() : "General")
                .imageUrl(course.getImageUrl())
                .tags(course.getTags() != null ? course.getTags() : new java.util.ArrayList<>())
                .instructorName(instructorName)
                .createdAt(course.getCreatedAt())
                .build();
    }

    private ModuleResponse mapToModuleResponse(Module module) {
        List<CurriculumItemResponse> items = module.getItems() != null ? module.getItems().stream()
                .map(item -> CurriculumItemResponse.builder()
                        .order(item.getOrder())
                        .type(item.getType())
                        .contentPayload(item.getContentPayload())
                        .title(item.getTitle())
                        .build())
                .collect(Collectors.toList()) : new java.util.ArrayList<>();

        return ModuleResponse.builder()
                .moduleId(module.getModuleId())
                .title(module.getTitle())
                .serialOrder(module.getSerialOrder())
                .items(items)
                .build();
    }
}
