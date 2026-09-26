package com.materialai.material_standardization.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cpse_mappings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CpseMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String cpseName;

    @Column(nullable = false)
    private String legacyMaterialCode;

    @Column(nullable = false, length = 500)
    private String legacyDescription;

    @Column(nullable = false)
    private String commonMaterialCode;

    private Double matchConfidence;

    @Column(length = 1000)
    private String matchReason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MappingStatus status = MappingStatus.AI_SUGGESTED;

    private String reviewedBy;

    private LocalDateTime reviewedAt;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();

        if (status == null) {
            status = MappingStatus.AI_SUGGESTED;
        }
    }
}