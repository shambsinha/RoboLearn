package com.robolearn.api.config;

import com.robolearn.api.entity.*;
import com.robolearn.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

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
    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        seedAdminUser();
        if (userRepository.count() <= 1) {
            seedStudentUsers();
        }
        if (courseRepository.count() == 0) {
            seedCourses();
        }
        if (problemRepository.count() == 0) {
            seedProblems();
        }
    }

    private void seedAdminUser() {
        userRepository.findByEmail("admin@robolearn.com").ifPresentOrElse(
            admin -> {
                admin.setPassword(passwordEncoder.encode("admin123"));
                userRepository.save(admin);
                log.info("Admin password reset for seeding consistency.");
            },
            () -> {
                userRepository.save(User.builder()
                        .username("admin")
                        .email("admin@robolearn.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role(UserRole.ADMIN)
                        .onboardingStatus("Professional")
                        .build());
                log.info("Admin user seeded.");
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
                        .onboardingStatus(i % 3 == 0 ? "Final Year" : "1st Year")
                        .build());
            }
        }
        log.info("Seeded 20 student users.");
    }

    private void seedCourses() {
        // Courses are now created dynamically via API to avoid hardcoded content.
        log.info("Skipping course seeding. Courses should be created via Admin API.");
    }

    private com.robolearn.api.entity.Module createModule(String id, String title, Integer order) {
        return com.robolearn.api.entity.Module.builder()
                .moduleId(id)
                .title(title)
                .serialOrder(order)
                .items(new java.util.ArrayList<>())
                .build();
    }

    private void seedProblems() {
        problemRepository.deleteAll();
        testCaseRepository.deleteAll();
        
        // DSA: Array/Hashing
        createProblem(1L, "Contains Duplicate", "Given an integer array `nums`, return `true` if any value appears at least twice.", "EASY", Arrays.asList("DSA", "Array"), 
            "class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        return false;\n    }\n}", "[1,2,3,1]", "true");
        
        // DSA: String
        createProblem(2L, "Valid Anagram", "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`.", "EASY", Arrays.asList("DSA", "String"), 
            "class Solution {\n    public boolean isAnagram(String s, String t) {\n        return false;\n    }\n}", "\"anagram\", \"nagaram\"", "true");

        log.info("Seeded specialized problems.");
    }

    private void createProblem(Long id, String title, String desc, String diff, List<String> tags, String code, String input, String output) {
        CodingProblem problem = CodingProblem.builder()
                .id(id)
                .title(title)
                .description(desc)
                .difficulty(diff)
                .tags(tags)
                .boilerplateCode(code)
                .build();
        
        problemRepository.save(problem);

        TestCase tc1 = TestCase.builder()
                .id(id * 10 + 1)
                .input(input)
                .expectedOutput(output)
                .isHidden(false)
                .problemId(id)
                .build();
        testCaseRepository.save(tc1);

        TestCase tc2 = TestCase.builder()
                .id(id * 10 + 2)
                .input(input + " (hidden)")
                .expectedOutput(output)
                .isHidden(true)
                .problemId(id)
                .build();
        testCaseRepository.save(tc2);

        problem.setTestCaseIds(Arrays.asList(tc1.getId(), tc2.getId()));
        problemRepository.save(problem);
    }
}