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
public class CourseController {

    private final CourseService courseService;
    private final CloudinaryService cloudinaryService;

    // --- SHARED ENDPOINTS ---
    
    @GetMapping
    @PreAuthorize("hasAuthority('COURSE_READ')")
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{courseId}")
    @PreAuthorize("hasAuthority('COURSE_READ')")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable String courseId) {
        return ResponseEntity.ok(courseService.getCourseById(courseId));
    }

    @GetMapping("/{courseId}/problems")
    @PreAuthorize("hasAuthority('COURSE_READ')")
    public ResponseEntity<List<CodingProblem>> getCourseProblems(@PathVariable String courseId) {
        return ResponseEntity.ok(courseService.getCourseProblems(courseId));
    }

    // --- STUDENT ENDPOINTS ---

    @GetMapping("/enrolled")
    @PreAuthorize("hasAuthority('COURSE_READ')")
    public ResponseEntity<List<CourseResponse>> getEnrolledCourses() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(courseService.getEnrolledCourses(email));
    }

    @PostMapping("/{courseId}/enroll")
    @PreAuthorize("hasAuthority('COURSE_READ')")
    public ResponseEntity<Void> enrollInCourse(@PathVariable String courseId) {
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
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        courseService.markItemComplete(email, courseId, moduleId, itemOrder, type);
        return ResponseEntity.ok().build();
    }

    // --- INSTRUCTOR/ADMIN ENDPOINTS ---

    @PostMapping("/upload-image")
    @PreAuthorize("hasAuthority('COURSE_CREATE') or hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<?> uploadContentImage(@RequestParam("file") MultipartFile file) {
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
        return ResponseEntity.ok(courseService.createCourse(request));
    }

    @PutMapping("/{courseId}")
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<CourseResponse> updateCourse(@PathVariable String courseId, @Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.updateCourse(courseId, request));
    }

    @DeleteMapping("/{courseId}")
    @PreAuthorize("hasAuthority('COURSE_DELETE')")
    public ResponseEntity<Void> deleteCourse(@PathVariable String courseId) {
        courseService.deleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{courseId}/modules")
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<ModuleResponse> addModule(@PathVariable String courseId, @Valid @RequestBody ModuleRequest request) {
        return ResponseEntity.ok(courseService.addModule(courseId, request));
    }

    @DeleteMapping("/modules/{moduleId}")
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<Void> deleteModule(@PathVariable String moduleId) {
        courseService.deleteModule(moduleId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/modules/{moduleId}/items")
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<ModuleResponse> updateModuleItems(@PathVariable String moduleId, @Valid @RequestBody List<CurriculumItemRequest> requests) {
        return ResponseEntity.ok(courseService.updateModuleItems(moduleId, requests));
    }

    @PostMapping("/{courseId}/problems/{problemId}")
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<Void> addProblemToCourse(@PathVariable String courseId, @PathVariable Long problemId) {
        courseService.addProblemToCourse(courseId, problemId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{courseId}/problems/{problemId}")
    @PreAuthorize("hasAuthority('COURSE_UPDATE')")
    public ResponseEntity<Void> removeProblemFromCourse(@PathVariable String courseId, @PathVariable Long problemId) {
        courseService.removeProblemFromCourse(courseId, problemId);
        return ResponseEntity.noContent().build();
    }
}
