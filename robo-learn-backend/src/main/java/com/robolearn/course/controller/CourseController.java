package com.robolearn.course.controller;

import com.robolearn.course.dto.request.CourseRequest;
import com.robolearn.course.dto.request.ModuleRequest;
import com.robolearn.course.dto.request.CurriculumItemRequest;
import com.robolearn.course.dto.response.CourseResponse;
import com.robolearn.course.dto.response.ModuleResponse;
import com.robolearn.problem.entity.CodingProblem;
import com.robolearn.course.service.CourseService;
import com.robolearn.core.service.CloudinaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class CourseController {

    private final CourseService courseService;
    private final CloudinaryService cloudinaryService;

    // --- SHARED ENDPOINTS ---
    
    @GetMapping
    @PreAuthorize("hasAuthority('COURSE_READ')")
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        log.info("Executing getAllCourses");
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{courseId}")
    @PreAuthorize("hasAuthority('COURSE_READ')")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable String courseId) {
        log.info("Executing getCourseById with courseId={}", courseId);
        return ResponseEntity.ok(courseService.getCourseById(courseId));
    }

    @GetMapping("/{courseId}/problems")
    @PreAuthorize("hasAuthority('COURSE_READ')")
    public ResponseEntity<List<CodingProblem>> getCourseProblems(@PathVariable String courseId) {
        log.info("Executing getCourseProblems with courseId={}", courseId);
        return ResponseEntity.ok(courseService.getCourseProblems(courseId));
    }

    // --- STUDENT ENDPOINTS ---

    @GetMapping("/enrolled")
    @PreAuthorize("hasAuthority('COURSE_READ')")
    public ResponseEntity<List<CourseResponse>> getEnrolledCourses() {
        log.info("Executing getEnrolledCourses");
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(courseService.getEnrolledCourses(email));
    }

    @PostMapping("/{courseId}/enroll")
    @PreAuthorize("hasAuthority('COURSE_READ')")
    public ResponseEntity<Void> enrollInCourse(@PathVariable String courseId) {
        log.info("Executing enrollInCourse with courseId={}", courseId);
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        courseService.enrollInCourse(email, courseId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{courseId}/progress")
    @PreAuthorize("hasAuthority('COURSE_READ')")
    public ResponseEntity<java.util.Set<String>> getCourseProgress(@PathVariable String courseId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(courseService.getUserCourseProgress(email, courseId));
    }

    @PostMapping("/{courseId}/modules/{moduleId}/items/{itemOrder}/complete")
    @PreAuthorize("hasAuthority('COURSE_READ')")
    public ResponseEntity<Void> markItemComplete(
            @PathVariable String courseId,
            @PathVariable String moduleId,
            @PathVariable Integer itemOrder,
            @RequestParam String type) {
        log.info("Executing markItemComplete with courseId={}, moduleId={}, itemOrder={}, type={}", courseId, moduleId, itemOrder, type);
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        courseService.markItemComplete(email, courseId, moduleId, itemOrder, type);
        return ResponseEntity.ok().build();
    }

    // --- INSTRUCTOR/ADMIN ENDPOINTS ---

    @PostMapping("/upload-image")
    @PreAuthorize("hasAuthority('COURSE_CREATE') or hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<?> uploadContentImage(@RequestParam("file") MultipartFile file) {
        log.info("Executing uploadContentImage");
        try {
            String url = cloudinaryService.uploadContentImage(file);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Image upload failed: " + e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('COURSE_CREATE')")
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CourseRequest request) {
        log.info("Executing createCourse");
        return ResponseEntity.ok(courseService.createCourse(request));
    }

    @PutMapping("/{courseId}")
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<CourseResponse> updateCourse(@PathVariable String courseId, @Valid @RequestBody CourseRequest request) {
        log.info("Executing updateCourse with courseId={}", courseId);
        return ResponseEntity.ok(courseService.updateCourse(courseId, request));
    }

    @DeleteMapping("/{courseId}")
    @PreAuthorize("hasAuthority('COURSE_DELETE')")
    public ResponseEntity<Void> deleteCourse(@PathVariable String courseId) {
        log.info("Executing deleteCourse with courseId={}", courseId);
        courseService.deleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{courseId}/modules")
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<ModuleResponse> addModule(@PathVariable String courseId, @Valid @RequestBody ModuleRequest request) {
        log.info("Executing addModule with courseId={}", courseId);
        return ResponseEntity.ok(courseService.addModule(courseId, request));
    }

    @DeleteMapping("/modules/{moduleId}")
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<Void> deleteModule(@PathVariable String moduleId) {
        log.info("Executing deleteModule with moduleId={}", moduleId);
        courseService.deleteModule(moduleId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/modules/{moduleId}/items")
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<ModuleResponse> updateModuleItems(@PathVariable String moduleId, @Valid @RequestBody List<CurriculumItemRequest> requests) {
        log.info("Executing updateModuleItems with moduleId={}, requests={}", moduleId, requests);
        return ResponseEntity.ok(courseService.updateModuleItems(moduleId, requests));
    }

    @PostMapping("/{courseId}/problems/{problemId}")
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<Void> addProblemToCourse(@PathVariable String courseId, @PathVariable Long problemId) {
        log.info("Executing addProblemToCourse with courseId={}, problemId={}", courseId, problemId);
        courseService.addProblemToCourse(courseId, problemId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{courseId}/problems/{problemId}")
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<Void> removeProblemFromCourse(@PathVariable String courseId, @PathVariable Long problemId) {
        log.info("Executing removeProblemFromCourse with courseId={}, problemId={}", courseId, problemId);
        courseService.removeProblemFromCourse(courseId, problemId);
        return ResponseEntity.noContent().build();
    }
}
