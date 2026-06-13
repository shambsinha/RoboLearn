package com.robolearn.core.config;

import com.robolearn.user.repository.UserRepository;
import com.robolearn.user.repository.RoleRepository;
import com.robolearn.course.repository.CourseRepository;
import com.robolearn.problem.repository.CodingProblemRepository;
import com.robolearn.problem.repository.TestCaseRepository;
import com.robolearn.course.entity.Course;
import com.robolearn.user.entity.User;
import com.robolearn.user.entity.Role;
import com.robolearn.course.entity.Module;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(prefix = "app.seeder", name = "enabled", havingValue = "true")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CourseRepository courseRepository;
    private final CodingProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaCourseSeeder javaCourseSeeder;

    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        log.info("[Seeder] Starting data maintenance sequence...");
        
        // 1. Seed Core RBAC Test Users
        seedCoreUsers();

        // 2. Seed Course Content via Specialized Seeder
        javaCourseSeeder.seedJavaCourse();
        
        log.info("[Seeder] Data synchronization completed.");
    }

    private void seedCoreUsers() {
        // 1. Seed Admin
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new RuntimeException("Error: ADMIN role is not found."));
        createUserIfNotFound("admin", "admin@robolearn.com", "admin123", adminRole, 5000);

        // 2. Seed Instructor
        Role instructorRole = roleRepository.findByName("INSTRUCTOR")
                .orElseThrow(() -> new RuntimeException("Error: INSTRUCTOR role is not found."));
        createUserIfNotFound("instructor", "instructor@robolearn.com", "instructor123", instructorRole, 1000);

        // 3. Seed Student
        Role studentRole = roleRepository.findByName("STUDENT")
                .orElseThrow(() -> new RuntimeException("Error: STUDENT role is not found."));
        createUserIfNotFound("student", "student@robolearn.com", "student123", studentRole, 0);

        log.info("[Seeder] 3 core test users (ADMIN, INSTRUCTOR, STUDENT) have been successfully verified/seeded.");
    }

    private void createUserIfNotFound(String username, String email, String password, Role role, int xp) {
        Set<Role> roles = new HashSet<>();
        roles.add(role);

        userRepository.findByUsernameOrEmail(username, email).ifPresentOrElse(
            existingUser -> {
                log.info("[Seeder] User '{}' detected. Force resetting secure credentials and roles...", username);
                existingUser.setUsername(username);
                existingUser.setEmail(email);
                existingUser.setPassword(passwordEncoder.encode(password));
                existingUser.setRoles(roles);
                existingUser.setXp(xp);
                userRepository.save(existingUser);
            },
            () -> {
                userRepository.save(User.builder()
                        .username(username)
                        .email(email)
                        .password(passwordEncoder.encode(password))
                        .roles(roles)
                        .xp(xp)
                        .build());
                log.info("[Seeder] User '{}' generated.", username);
            }
        );
    }

    private com.robolearn.course.entity.Module createModule(String id, String title, Integer order) {
        return com.robolearn.course.entity.Module.builder()
                .moduleId(id)
                .title(title)
                .serialOrder(order)
                .items(new java.util.ArrayList<>())
                .build();
    }
}
