package com.robolearn.submission.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_solutions", indexes = {
    @Index(name = "idx_user_problem", columnList = "user_id, problem_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSolution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "problem_id", nullable = false)
    private Long problemId;

    @Column(name = "solution_code", columnDefinition = "TEXT")
    private String solutionCode;

    @Column(nullable = false)
    private String language;

    @Column(nullable = false)
    private String difficulty;

    @Column(name = "xp_awarded", nullable = false)
    private Integer xpAwarded;

    @CreationTimestamp
    @Column(name = "solved_at", updatable = false)
    private LocalDateTime solvedAt;
}
