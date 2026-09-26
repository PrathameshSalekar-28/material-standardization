package com.materialai.material_standardization.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MaterialRequestDTO {

    @NotBlank(message = "Material code is required")
    private String materialCode;

    @NotBlank(message = "Description is required")
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
}