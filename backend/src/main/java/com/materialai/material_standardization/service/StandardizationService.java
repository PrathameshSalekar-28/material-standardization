package com.materialai.material_standardization.service;

import com.materialai.material_standardization.dto.StandardizationResponseDTO;
import com.materialai.material_standardization.entity.Material;
import com.materialai.material_standardization.entity.StandardizedMaterial;
import com.materialai.material_standardization.repository.MaterialRepository;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class StandardizationService {

    private final MaterialRepository materialRepository;
    private final StandardizedMaterialService standardizedMaterialService;

    public StandardizationService(
            MaterialRepository materialRepository,
            StandardizedMaterialService standardizedMaterialService) {

        this.materialRepository = materialRepository;
        this.standardizedMaterialService = standardizedMaterialService;
    }

    // =============================================================
    // MAIN STANDARDIZATION METHOD
    // =============================================================

    public StandardizationResponseDTO standardize(
            List<Long> materialIds) {

        // ---------------------------------------------------------
        // 1. Validate selection
        // ---------------------------------------------------------

        if (materialIds == null || materialIds.isEmpty()) {

            throw new RuntimeException(
                    "Please select materials for standardization"
            );
        }

        if (materialIds.size() < 2) {

            throw new RuntimeException(
                    "Select at least two materials for standardization"
            );
        }

        // Remove duplicate IDs while preserving order
        List<Long> uniqueMaterialIds =
                new ArrayList<>(
                        new LinkedHashSet<>(materialIds)
                );

        // ---------------------------------------------------------
        // 2. Fetch selected materials
        // ---------------------------------------------------------

        List<Material> materials =
                materialRepository.findAllById(uniqueMaterialIds);

        if (materials.isEmpty()) {

            throw new RuntimeException(
                    "No materials found for standardization"
            );
        }

        // Check whether every selected ID exists
        if (materials.size() != uniqueMaterialIds.size()) {

            throw new RuntimeException(
                    "One or more selected materials were not found"
            );
        }

        // ---------------------------------------------------------
        // 3. Validate material equivalence
        // ---------------------------------------------------------

        validateEquivalentMaterials(materials);

        // ---------------------------------------------------------
        // 4. Determine standardized fields
        // ---------------------------------------------------------

        String materialType =
                mostCommon(
                        materials,
                        Material::getMaterialType
                );

        String materialGroup =
                mostCommon(
                        materials,
                        Material::getMaterialGroup
                );

        String grade =
                mostCommon(
                        materials,
                        Material::getGrade
                );

        String size =
                mostCommon(
                        materials,
                        Material::getSize
                );

        String standard =
                mostCommon(
                        materials,
                        Material::getStandard
                );

        String unit =
                mostCommon(
                        materials,
                        Material::getUnit
                );

        // ---------------------------------------------------------
        // 5. Build standardized description
        // ---------------------------------------------------------

        String standardizedDescription =
                buildStandardizedDescription(
                        materialType,
                        grade,
                        size,
                        standard
                );

        // ---------------------------------------------------------
        // 6. Generate common material code
        // ---------------------------------------------------------

        String commonMaterialCode =
                generateCommonMaterialCode(
                        materialType,
                        grade,
                        size
                );

        // ---------------------------------------------------------
        // 7. Collect legacy material codes
        // ---------------------------------------------------------

        List<String> legacyCodes =
                materials.stream()
                        .map(Material::getMaterialCode)
                        .filter(Objects::nonNull)
                        .distinct()
                        .toList();

        // ---------------------------------------------------------
        // 8. Collect CPSE names
        // ---------------------------------------------------------

        List<String> cpseNames =
                materials.stream()
                        .map(Material::getCpseName)
                        .filter(Objects::nonNull)
                        .distinct()
                        .toList();

        // ---------------------------------------------------------
        // 9. Create standardized material proposal
        // ---------------------------------------------------------

        StandardizedMaterial proposal =
                new StandardizedMaterial();

        proposal.setCommonMaterialCode(
                commonMaterialCode
        );

        proposal.setStandardizedDescription(
                standardizedDescription
        );

        proposal.setMaterialType(
                materialType
        );

        proposal.setMaterialGroup(
                materialGroup
        );

        proposal.setGrade(
                grade
        );

        proposal.setSize(
                size
        );

        proposal.setStandard(
                standard
        );

        proposal.setUnit(
                unit
        );

        standardizedMaterialService.createProposal(
                proposal
        );

        // ---------------------------------------------------------
        // 10. Return result
        // ---------------------------------------------------------

        return new StandardizationResponseDTO(
                commonMaterialCode,
                standardizedDescription,
                materialType,
                materialGroup,
                grade,
                size,
                standard,
                unit,
                legacyCodes,
                cpseNames
        );
    }

    // =============================================================
    // MATERIAL EQUIVALENCE VALIDATION
    // =============================================================

    private void validateEquivalentMaterials(
            List<Material> materials) {

        Material reference =
                materials.get(0);

        String referenceType =
                normalize(reference.getMaterialType());

        String referenceGroup =
                normalize(reference.getMaterialGroup());

        String referenceGrade =
                normalize(reference.getGrade());

        String referenceSize =
                normalize(reference.getSize());

        String referenceStandard =
                normalize(reference.getStandard());

        // ---------------------------------------------------------
        // Validate every selected material against first material
        // ---------------------------------------------------------

        for (Material material : materials) {

            String currentType =
                    normalize(material.getMaterialType());

            String currentGroup =
                    normalize(material.getMaterialGroup());

            String currentGrade =
                    normalize(material.getGrade());

            String currentSize =
                    normalize(material.getSize());

            String currentStandard =
                    normalize(material.getStandard());

            // -----------------------------------------------------
            // Material Type
            // -----------------------------------------------------

            if (!referenceType.equals(currentType)) {

                throw new RuntimeException(
                        "Selected materials are not equivalent. " +
                        "Material type mismatch: " +
                        reference.getMaterialCode() +
                        " (" +
                        safeValue(
                                reference.getMaterialType()
                        ) +
                        ")" +
                        " vs " +
                        material.getMaterialCode() +
                        " (" +
                        safeValue(
                                material.getMaterialType()
                        ) +
                        ")"
                );
            }

            // -----------------------------------------------------
            // Material Group
            // -----------------------------------------------------

            if (!referenceGroup.equals(currentGroup)) {

                throw new RuntimeException(
                        "Selected materials are not equivalent. " +
                        "Material group mismatch: " +
                        reference.getMaterialCode() +
                        " (" +
                        safeValue(
                                reference.getMaterialGroup()
                        ) +
                        ")" +
                        " vs " +
                        material.getMaterialCode() +
                        " (" +
                        safeValue(
                                material.getMaterialGroup()
                        ) +
                        ")"
                );
            }

            // -----------------------------------------------------
            // Grade
            // -----------------------------------------------------

            if (!referenceGrade.equals(currentGrade)) {

                throw new RuntimeException(
                        "Selected materials are not equivalent. " +
                        "Grade mismatch: " +
                        reference.getMaterialCode() +
                        " (" +
                        safeValue(
                                reference.getGrade()
                        ) +
                        ")" +
                        " vs " +
                        material.getMaterialCode() +
                        " (" +
                        safeValue(
                                material.getGrade()
                        ) +
                        ")"
                );
            }

            // -----------------------------------------------------
            // Size
            // -----------------------------------------------------

            if (!referenceSize.equals(currentSize)) {

                throw new RuntimeException(
                        "Selected materials are not equivalent. " +
                        "Size mismatch: " +
                        reference.getMaterialCode() +
                        " (" +
                        safeValue(
                                reference.getSize()
                        ) +
                        ")" +
                        " vs " +
                        material.getMaterialCode() +
                        " (" +
                        safeValue(
                                material.getSize()
                        ) +
                        ")"
                );
            }

            // -----------------------------------------------------
            // Standard
            // -----------------------------------------------------

            if (!referenceStandard.equals(currentStandard)) {

                throw new RuntimeException(
                        "Selected materials are not equivalent. " +
                        "Standard mismatch: " +
                        reference.getMaterialCode() +
                        " (" +
                        safeValue(
                                reference.getStandard()
                        ) +
                        ")" +
                        " vs " +
                        material.getMaterialCode() +
                        " (" +
                        safeValue(
                                material.getStandard()
                        ) +
                        ")"
                );
            }
        }
    }

    // =============================================================
    // NORMALIZE VALUES FOR COMPARISON
    // =============================================================

    private String normalize(String value) {

        if (value == null) {
            return "";
        }

        return value
                .trim()
                .toUpperCase()
                .replaceAll("[^A-Z0-9]", "");
    }

    // =============================================================
    // HANDLE NULL / EMPTY VALUES IN ERROR MESSAGE
    // =============================================================

    private String safeValue(String value) {

        if (value == null || value.isBlank()) {
            return "N/A";
        }

        return value;
    }

    // =============================================================
    // FIND MOST COMMON VALUE
    // =============================================================

    private String mostCommon(
            List<Material> materials,
            Function<Material, String> getter) {

        return materials.stream()
                .map(getter)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .collect(
                        Collectors.groupingBy(
                                value -> value,
                                Collectors.counting()
                        )
                )
                .entrySet()
                .stream()
                .max(
                        Map.Entry.comparingByValue()
                )
                .map(Map.Entry::getKey)
                .orElse(null);
    }

    // =============================================================
    // BUILD STANDARDIZED DESCRIPTION
    // =============================================================

    private String buildStandardizedDescription(
            String materialType,
            String grade,
            String size,
            String standard) {

        List<String> parts =
                new ArrayList<>();

        if (materialType != null &&
                !materialType.isBlank()) {

            parts.add(materialType);
        }

        if (grade != null &&
                !grade.isBlank()) {

            parts.add(grade);
        }

        if (size != null &&
                !size.isBlank()) {

            parts.add(size);
        }

        if (standard != null &&
                !standard.isBlank()) {

            parts.add(standard);
        }

        return String.join(
                " ",
                parts
        );
    }

    // =============================================================
    // GENERATE COMMON MATERIAL CODE
    // =============================================================

    private String generateCommonMaterialCode(
            String materialType,
            String grade,
            String size) {

        String type =
                cleanForCode(materialType);

        String materialGrade =
                cleanForCode(grade);

        String materialSize =
                cleanForCode(size);

        StringBuilder code =
                new StringBuilder("NMF");

        if (!type.isEmpty()) {

            code.append("-")
                    .append(type);
        }

        if (!materialGrade.isEmpty()) {

            code.append("-")
                    .append(materialGrade);
        }

        if (!materialSize.isEmpty()) {

            code.append("-")
                    .append(materialSize);
        }

        return code.toString();
    }

    // =============================================================
    // CLEAN VALUE FOR COMMON CODE
    // =============================================================

    private String cleanForCode(String value) {

        if (value == null) {
            return "";
        }

        return value
                .toUpperCase()
                .replaceAll("[^A-Z0-9]+", "")
                .trim();
    }
}