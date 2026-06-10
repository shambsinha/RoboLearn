package com.robolearn.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider")
    @Builder.Default
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_enrolled_courses", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "course_id")
    @Builder.Default
    private java.util.Set<String> enrolledCourseIds = new java.util.HashSet<>();

    @Column(name = "is_suspended", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean isSuspended = false;

    @Column(name = "xp", nullable = false, columnDefinition = "int default 0")
    @Builder.Default
    private Integer xp = 0;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @Column(name = "solved_easy", nullable = false, columnDefinition = "int default 0")
    @Builder.Default
    private Integer solvedEasy = 0;

    @Column(name = "solved_medium", nullable = false, columnDefinition = "int default 0")
    @Builder.Default
    private Integer solvedMedium = 0;

    @Column(name = "solved_hard", nullable = false, columnDefinition = "int default 0")
    @Builder.Default
    private Integer solvedHard = 0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_streak_dates", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "solved_date")
    @Builder.Default
    private java.util.Set<String> streakDates = new java.util.HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_attempted_dates", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "attempt_date")
    @Builder.Default
    private java.util.Set<String> attemptedDates = new java.util.HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_solved_problems", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "problem_id")
    @Builder.Default
    private java.util.Set<Long> solvedProblemIds = new java.util.HashSet<>();
}
