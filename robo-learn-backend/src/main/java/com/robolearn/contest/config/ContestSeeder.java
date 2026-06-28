package com.robolearn.contest.config;

import com.robolearn.contest.entity.Contest;
import com.robolearn.contest.repository.ContestRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class ContestSeeder {

    @Bean
    public CommandLineRunner seedContests(ContestRepository contestRepository) {
        return args -> {
            if (contestRepository.count() == 0) {
                Contest c1 = Contest.builder()
                        .title("Weekly Algorithmic Challenge #42")
                        .description("Test your algorithmic problem-solving skills in our weekly contest. Features dynamic programming, graph traversal, and more.")
                        .startTime(LocalDateTime.now().plusDays(2))
                        .endTime(LocalDateTime.now().plusDays(2).plusHours(2))
                        .createdBy(1L)
                        .problemIds(List.of("mock-prob-1", "mock-prob-2"))
                        .build();

                Contest c2 = Contest.builder()
                        .title("Rookie Tournament")
                        .description("A beginner-friendly contest for those just starting out with data structures.")
                        .startTime(LocalDateTime.now().minusDays(1))
                        .endTime(LocalDateTime.now().plusDays(1))
                        .createdBy(1L)
                        .problemIds(List.of("mock-prob-3"))
                        .build();

                contestRepository.saveAll(List.of(c1, c2));
                System.out.println("Seeded dummy contests.");
            }
        };
    }
}
