package com.robolearn.course.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_curriculum_progress", uniqueConstraints = {
    @UniqueConstraint(name = "uc_user_item", columnNames = {"user_id", "course_id", "module_id", "item_order"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCurriculumProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "course_id", nullable = false)
    private String courseId;

    @Column(name = "module_id", nullable = false)
    private String moduleId;

    @Column(name = "item_order", nullable = false)
    private Integer itemOrder;

    @Column(nullable = false)
    private String type; // "VIDEO", "THEORY", "PROBLEM"

    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    private boolean isCompleted = true;

    @CreationTimestamp
    @Column(name = "completed_at", updatable = false)
    private LocalDateTime completedAt;
}
