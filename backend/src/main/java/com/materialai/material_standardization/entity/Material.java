package com.materialai.material_standardization.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "materials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ==================================================
    // ORIGINAL MATERIAL DETAILS
    // ==================================================

    @Column(nullable = false)
    private String materialCode;

    @Column(nullable = false, length = 500)
    private String description;

    private String materialType;

    private String materialGroup;

    private String grade;

    private String size;

    private String standard;

    private String diameter;

    private String length;

    private String unit;

    private String cpseName;


    // ==================================================
    // STANDARDIZATION / APPROVAL DETAILS
    // ==================================================

    /*
     * Material approval status.
     *
     * Possible values:
     * PENDING
     * APPROVED
     * REJECTED
     */
    private String status = "PENDING";


    /*
     * National Material Code generated
     * after Admin / Reviewer approval.
     *
     * Example:
     * NMC-STEEL-001
     */
    private String nationalMaterialCode;


    /*
     * Name/role of the person who reviewed
     * the material.
     *
     * Example:
     * Admin
     * Reviewer
     */
    private String reviewedBy;


    /*
     * Optional remarks provided during
     * approval or rejection.
     */
    @Column(length = 500)
    private String reviewRemarks;
}