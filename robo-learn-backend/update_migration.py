import os

filepath = r"C:\Users\Aayush Sinha\Desktop\RoboLearn\robo-learn-backend\src\main\java\com\robolearn\course\config\SqlCourseSeedMigration.java"

content = """package com.robolearn.course.config;

import com.robolearn.course.entity.Course;
import com.robolearn.course.entity.Module;
import com.robolearn.course.repository.CourseRepository;
import com.robolearn.problem.entity.CodingProblem;
import com.robolearn.problem.entity.TestCase;
import com.robolearn.problem.repository.CodingProblemRepository;
import com.robolearn.problem.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Configuration
@RequiredArgsConstructor
@Slf4j
@Order(3)
public class SqlCourseSeedMigration implements CommandLineRunner {

    private final CourseRepository courseRepository;
    private final CodingProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;

    @Override
    public void run(String... args) throws Exception {
        if (courseRepository.findAll().stream().anyMatch(c -> c.getTitle().contains("SQL Mastery"))) {
            log.info("Migration: SQL Course already seeded. Skipping.");
            return;
        }

        log.info("Migration: Seeding SQL Mastery Course and Problems...");

        TestCase tc1 = TestCase.builder().id(10011L).input("").expectedOutput("1,Alice,alice@test.com\\n2,Bob,bob@test.com").isHidden(false).build();
        TestCase tc2 = TestCase.builder().id(10021L).input("").expectedOutput("Alice\\nCharlie").isHidden(false).build();
        TestCase tc3 = TestCase.builder().id(10031L).input("").expectedOutput("Alice,101\\nBob,102").isHidden(false).build();
        
        testCaseRepository.saveAll(List.of(tc1, tc2, tc3));

        CodingProblem p1 = CodingProblem.builder()
                .id(1001L)
                .title("Select All Users")
                .description("Write a SQL query to retrieve all columns from the `users` table.\\n\\n**users schema**\\n| id | name | email |\\n\\n**Expected Result Columns**\\n| id | name | email |")
                .difficulty("EASY")
                .tags(List.of("SQL", "Database", "SELECT"))
                .createdBy(1L)
                .driverCodeTemplate(Map.of("sql", "CREATE TABLE users (id INTEGER, name TEXT, email TEXT);\\nINSERT INTO users VALUES (1, 'Alice', 'alice@test.com'), (2, 'Bob', 'bob@test.com');"))
                .testCaseIds(List.of(10011L))
                .build();

        CodingProblem p2 = CodingProblem.builder()
                .id(1002L)
                .title("Filter by Age")
                .description("Write a SQL query to retrieve the names of users who are older than 18 from the `users` table.\\n\\n**users schema**\\n| id | name | age |\\n\\n**Expected Result Columns**\\n| name |")
                .difficulty("EASY")
                .tags(List.of("SQL", "Database", "WHERE"))
                .createdBy(1L)
                .driverCodeTemplate(Map.of("sql", "CREATE TABLE users (id INTEGER, name TEXT, age INTEGER);\\nINSERT INTO users VALUES (1, 'Alice', 20), (2, 'Bob', 15), (3, 'Charlie', 25);"))
                .testCaseIds(List.of(10021L))
                .build();
                
        CodingProblem p3 = CodingProblem.builder()
                .id(1003L)
                .title("Join Tables")
                .description("Write a SQL query to retrieve the `name` of the user and their `order_id`. Join the `users` and `orders` tables.\\n\\n**users schema**\\n| id | name |\\n\\n**orders schema**\\n| order_id | user_id |\\n\\n**Expected Result Columns**\\n| name | order_id |")
                .difficulty("MEDIUM")
                .tags(List.of("SQL", "Database", "JOIN"))
                .createdBy(1L)
                .driverCodeTemplate(Map.of("sql", "CREATE TABLE users (id INTEGER, name TEXT);\\nCREATE TABLE orders (order_id INTEGER, user_id INTEGER);\\nINSERT INTO users VALUES (1, 'Alice'), (2, 'Bob');\\nINSERT INTO orders VALUES (101, 1), (102, 2);"))
                .testCaseIds(List.of(10031L))
                .build();

        problemRepository.saveAll(List.of(p1, p2, p3));

        Course sqlCourse = Course.builder()
                .courseId("sql-mastery-001")
                .title("SQL Mastery: Beginner to Advanced")
                .description("Master SQL from the ground up! Learn to select data, filter, join tables, and write advanced analytical queries.")
                .level("BEGINNER")
                .category("Database")
                .tags(List.of("SQL", "Databases", "Data Science"))
                .imageUrl("https://cdn-icons-png.flaticon.com/512/2772/2772128.png")
                .createdBy(1L)
                .problemIds(List.of(1001L, 1002L, 1003L))
                .createdAt(LocalDateTime.now())
                .modules(List.of(
                        Module.builder()
                                .moduleId(UUID.randomUUID().toString())
                                .title("Module 1: Basics of SELECT")
                                .serialOrder(1)
                                .items(List.of(
                                        Module.CurriculumItem.builder().order(1).type("THEORY").title("Introduction to SQL").contentPayload("SQL stands for Structured Query Language. It is used to communicate with a database.").build(),
                                        Module.CurriculumItem.builder().order(2).type("PROBLEM").title("Select All Users").contentPayload("1001").build()
                                ))
                                .build(),
                        Module.builder()
                                .moduleId(UUID.randomUUID().toString())
                                .title("Module 2: Filtering and Joins")
                                .serialOrder(2)
                                .items(List.of(
                                        Module.CurriculumItem.builder().order(1).type("PROBLEM").title("Filter by Age").contentPayload("1002").build(),
                                        Module.CurriculumItem.builder().order(2).type("PROBLEM").title("Join Tables").contentPayload("1003").build()
                                ))
                                .build()
                ))
                .build();

        courseRepository.save(sqlCourse);

        log.info("Migration: SQL Mastery Course successfully seeded!");
    }
}
"""

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated migration.")
