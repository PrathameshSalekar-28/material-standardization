package com.materialai.material_standardization.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MaterialResponseDTO {

    private Long id;

    private String materialCode;

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

    // ==========================================
    // STANDARDIZATION / APPROVAL
    // ==========================================

    private String status;

    private String nationalMaterialCode;

    private String reviewedBy;

    private String reviewRemarks;
}