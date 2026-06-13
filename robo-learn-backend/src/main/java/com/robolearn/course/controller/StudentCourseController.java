package com.robolearn.course.controller;

import com.robolearn.course.dto.response.CourseResponse;
import com.robolearn.problem.entity.CodingProblem;
import com.robolearn.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/courses")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('COURSE_READ')")
public class StudentCourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAvailableCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/enrolled")
    public ResponseEntity<List<CourseResponse>> getEnrolledCourses() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(courseService.getEnrolledCourses(email));
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
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        courseService.enrollInCourse(email, courseId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{courseId}/progress")
    public ResponseEntity<java.util.Set<String>> getCourseProgress(@PathVariable String courseId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(courseService.getUserCourseProgress(email, courseId));
    }

    @PostMapping("/{courseId}/modules/{moduleId}/items/{itemOrder}/complete")
    public ResponseEntity<Void> markItemComplete(
            @PathVariable String courseId,
            @PathVariable String moduleId,
            @PathVariable Integer itemOrder,
            @RequestParam String type) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        courseService.markItemComplete(email, courseId, moduleId, itemOrder, type);
        return ResponseEntity.ok().build();
    }
}
