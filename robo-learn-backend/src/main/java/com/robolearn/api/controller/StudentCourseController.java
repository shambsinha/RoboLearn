package com.robolearn.api.controller;

import com.robolearn.api.dto.response.CourseResponse;
import com.robolearn.api.entity.CodingProblem;
import com.robolearn.api.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/courses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class StudentCourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAvailableCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/enrolled")
    public ResponseEntity<List<CourseResponse>> getEnrolledCourses() {
        return ResponseEntity.ok(courseService.getEnrolledCourses());
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseResponse> getCourse(@PathVariable String courseId) {
        return ResponseEntity.ok(courseService.getCourseById(courseId));
    }

    @GetMapping("/{courseId}/problems")
    public ResponseEntity<List<CodingProblem>> getCourseProblems(@PathVariable String courseId) {
        return ResponseEntity.ok(courseService.getCourseProblems(courseId));
    }

    @PostMapping("/{courseId}/enroll")
    public ResponseEntity<Void> enrollInCourse(@PathVariable String courseId) {
        courseService.enrollInCourse(courseId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{courseId}/progress")
    public ResponseEntity<java.util.Set<String>> getCourseProgress(@PathVariable String courseId) {
        return ResponseEntity.ok(courseService.getUserCourseProgress(courseId));
    }

    @PostMapping("/{courseId}/modules/{moduleId}/items/{itemOrder}/complete")
    public ResponseEntity<Void> markItemComplete(
            @PathVariable String courseId,
            @PathVariable String moduleId,
            @PathVariable Integer itemOrder,
            @RequestParam String type) {
        courseService.markItemComplete(courseId, moduleId, itemOrder, type);
        return ResponseEntity.ok().build();
    }
}
