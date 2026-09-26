package com.materialai.material_standardization.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StandardizationResponseDTO {

    private String commonMaterialCode;

    private String standardizedDescription;

    private String materialType;

    private String materialGroup;

    private String grade;

    private String size;

    private String standard;

    private String unit;

    private List<String> legacyMaterialCodes;

    private List<String> cpseNames;
}