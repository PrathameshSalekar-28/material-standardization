package com.materialai.material_standardization.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cpse_mapping_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CpseMappingHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long cpseMappingId;

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
    private MappingStatus action;

    @Column(nullable = false)
    private String reviewedBy;

    @Column(nullable = false)
    private LocalDateTime reviewedAt;
}
