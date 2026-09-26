package com.materialai.material_standardization.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "standardized_materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StandardizedMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String commonMaterialCode;

    @Column(nullable = false, length = 500)
    private String standardizedDescription;

    private String materialType;

    private String materialGroup;

    private String grade;

    private String size;

    private String standard;

    private String unit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus status = ApprovalStatus.PENDING_REVIEW;

    private String reviewedBy;

    private LocalDateTime reviewedAt;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();

        if (status == null) {
            status = ApprovalStatus.PENDING_REVIEW;
        }
    }
}