package com.robolearn.api.controller;

import com.robolearn.api.dto.request.CourseRequest;
import com.robolearn.api.dto.request.ModuleRequest;
import com.robolearn.api.dto.request.CurriculumItemRequest;
import com.robolearn.api.dto.response.CourseResponse;
import com.robolearn.api.dto.response.ModuleResponse;
import com.robolearn.api.entity.CodingProblem;
import com.robolearn.api.service.CourseService;
import com.robolearn.api.service.CloudinaryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/courses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCourseController {

    private final CourseService courseService;
    private final CloudinaryService cloudinaryService;

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadContentImage(@RequestParam("file") MultipartFile file) {
        try {
            String url = cloudinaryService.uploadContentImage(file);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Image upload failed: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.createCourse(request));
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<CourseResponse> updateCourse(@PathVariable String courseId, @Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.updateCourse(courseId, request));
    }

    @PostMapping("/{courseId}/modules")
    public ResponseEntity<ModuleResponse> addModule(@PathVariable String courseId, @Valid @RequestBody ModuleRequest request) {
        return ResponseEntity.ok(courseService.addModule(courseId, request));
    }

    @DeleteMapping("/modules/{moduleId}")
    public ResponseEntity<Void> deleteModule(@PathVariable String moduleId) {
        courseService.deleteModule(moduleId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/modules/{moduleId}/items")
    public ResponseEntity<ModuleResponse> updateModuleItems(@PathVariable String moduleId, @Valid @RequestBody List<CurriculumItemRequest> requests) {
        return ResponseEntity.ok(courseService.updateModuleItems(moduleId, requests));
    }

    @PostMapping("/{courseId}/problems/{problemId}")
    public ResponseEntity<Void> addProblemToCourse(@PathVariable String courseId, @PathVariable Long problemId) {
        courseService.addProblemToCourse(courseId, problemId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{courseId}/problems/{problemId}")
    public ResponseEntity<Void> removeProblemFromCourse(@PathVariable String courseId, @PathVariable Long problemId) {
        courseService.removeProblemFromCourse(courseId, problemId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{courseId}/problems")
    public ResponseEntity<List<CodingProblem>> getCourseProblems(@PathVariable String courseId) {
        return ResponseEntity.ok(courseService.getCourseProblems(courseId));
    }

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable String courseId) {
        return ResponseEntity.ok(courseService.getCourseById(courseId));
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteCourse(@PathVariable String courseId) {
        courseService.deleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }
}
