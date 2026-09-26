package com.materialai.material_standardization.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "approval_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long standardizedMaterialId;

    @Column(nullable = false)
    private String commonMaterialCode;

    @Column(nullable = false, length = 500)
    private String standardizedDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus action;

    @Column(nullable = false)
    private String reviewedBy;

    @Column(nullable = false)
    private LocalDateTime reviewedAt;

}
