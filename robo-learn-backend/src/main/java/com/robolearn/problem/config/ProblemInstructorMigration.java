package com.robolearn.problem.config;

import com.robolearn.problem.entity.CodingProblem;
import com.robolearn.problem.repository.CodingProblemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Migration file to set all existing problems to be created by Admin (user id: 1)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ProblemInstructorMigration implements CommandLineRunner {

    private final CodingProblemRepository problemRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Starting Mongo migration for CodingProblems...");
        List<CodingProblem> problems = problemRepository.findAll();
        int updatedCount = 0;

        for (CodingProblem problem : problems) {
            if (problem.getInstructorId() == null) {
                problem.setInstructorId(1L);
                problemRepository.save(problem);
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            log.info("Migration Complete: Updated {} coding problems with instructorId = 1 (Admin).", updatedCount);
        } else {
            log.info("Migration Skipped: All coding problems already have an instructorId.");
        }
    }
}
