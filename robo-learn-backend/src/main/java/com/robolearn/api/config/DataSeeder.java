package com.robolearn.api.config;

import com.robolearn.api.entity.*;
import com.robolearn.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CodingProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaCourseSeeder javaCourseSeeder;

    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        log.info("[Seeder] Starting data maintenance sequence...");
        
        // 1. Seed Admin
        seedAdminUser();
        
        // 2. Seed Student Users
        seedStudentUsers();

        // 3. Seed Course Content via Specialized Seeder
        javaCourseSeeder.seedJavaCourse();
        
        log.info("[Seeder] Data synchronization completed.");
    }

    private void seedAdminUser() {
        // Try finding by username OR email to prevent duplicates during login
        userRepository.findByUsernameOrEmail("admin", "admin@robolearn.com").ifPresentOrElse(
            admin -> {
                log.info("[Seeder] Admin entity detected. Force resetting secure credentials...");
                admin.setUsername("admin");
                admin.setEmail("admin@robolearn.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(UserRole.ADMIN);
                admin.setXp(5000);
                userRepository.save(admin);
            },
            () -> {
                userRepository.save(User.builder()
                        .username("admin")
                        .email("admin@robolearn.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role(UserRole.ADMIN)
                        .xp(5000)
                        .build());
                log.info("[Seeder] Primary admin node generated.");
            }
        );
    }

    private void seedStudentUsers() {
        String[] firstNames = {"John", "Jane", "Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Heidi"};
        String[] lastNames = {"Doe", "Smith", "Johnson", "Brown", "Taylor", "Miller", "Wilson", "Moore", "Anderson", "Thomas"};

        for (int i = 1; i <= 20; i++) {
            String firstName = firstNames[random.nextInt(firstNames.length)];
            String lastName = lastNames[random.nextInt(lastNames.length)];
            String username = (firstName + lastName + i).toLowerCase();
            String email = firstName.toLowerCase() + "." + lastName.toLowerCase() + i + "@email.com";

            if (userRepository.findByEmail(email).isEmpty()) {
                userRepository.save(User.builder()
                        .username(username)
                        .email(email)
                        .password(passwordEncoder.encode("password123"))
                        .role(UserRole.STUDENT)
                        .build());
            }
        }
        log.info("[Seeder] Seeded 20 student test nodes.");
    }

    private com.robolearn.api.entity.Module createModule(String id, String title, Integer order) {
        return com.robolearn.api.entity.Module.builder()
                .moduleId(id)
                .title(title)
                .serialOrder(order)
                .items(new java.util.ArrayList<>())
                .build();
    }
}
