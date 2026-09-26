package com.materialai.material_standardization.service;

import com.materialai.material_standardization.dto.MaterialRequestDTO;
import com.materialai.material_standardization.dto.MaterialResponseDTO;
import com.materialai.material_standardization.entity.Material;
import com.materialai.material_standardization.repository.MaterialRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class MaterialService {

    private final MaterialRepository materialRepository;

    public MaterialService(MaterialRepository materialRepository) {
        this.materialRepository = materialRepository;
    }

    // ==================================================
    // CREATE MATERIAL
    // ==================================================

    public MaterialResponseDTO createMaterial(MaterialRequestDTO request) {

        Material material = new Material();

        material.setMaterialCode(request.getMaterialCode());
        material.setDescription(request.getDescription());

        material.setMaterialType(request.getMaterialType());
        material.setMaterialGroup(request.getMaterialGroup());
        material.setGrade(request.getGrade());
        material.setSize(request.getSize());
        material.setStandard(request.getStandard());

        material.setDiameter(request.getDiameter());
        material.setLength(request.getLength());
        material.setUnit(request.getUnit());
        material.setCpseName(request.getCpseName());

        // New materials start as PENDING
        material.setStatus("PENDING");

        Material savedMaterial =
                materialRepository.save(material);

        return convertToResponse(savedMaterial);
    }


    // ==================================================
    // GET ALL MATERIALS
    // ==================================================

    public List<MaterialResponseDTO> getAllMaterials() {

        return materialRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // ==================================================
    // UPLOAD MATERIALS FROM CSV
    // ==================================================

    public void uploadMaterials(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Please select a CSV file.");
        }

        String fileName = file.getOriginalFilename();

        if (fileName == null ||
                !fileName.toLowerCase().endsWith(".csv")) {

            throw new RuntimeException(
                    "Only CSV files are supported."
            );
        }

        List<Material> materials = new ArrayList<>();

        try (
                BufferedReader reader =
                        new BufferedReader(
                                new InputStreamReader(
                                        file.getInputStream(),
                                        StandardCharsets.UTF_8
                                )
                        )
        ) {

            String line;

            // Skip CSV header
            reader.readLine();

            while ((line = reader.readLine()) != null) {

                if (line.trim().isEmpty()) {
                    continue;
                }

                String[] columns = line.split(
                        ",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)",
                        -1
                );

                if (columns.length < 9) {
                    continue;
                }

                Material material = new Material();

                material.setCpseName(
                        cleanValue(columns[0])
                );

                material.setMaterialCode(
                        cleanValue(columns[1])
                );

                material.setDescription(
                        cleanValue(columns[2])
                );

                material.setMaterialType(
                        cleanValue(columns[3])
                );

                material.setMaterialGroup(
                        cleanValue(columns[4])
                );

                material.setGrade(
                        cleanValue(columns[5])
                );

                material.setSize(
                        cleanValue(columns[6])
                );

                material.setStandard(
                        cleanValue(columns[7])
                );

                material.setUnit(
                        cleanValue(columns[8])
                );

                // ==========================================
                // NEW MATERIALS ARE PENDING BY DEFAULT
                // ==========================================

                material.setStatus("PENDING");

                materials.add(material);
            }

            if (materials.isEmpty()) {
                throw new RuntimeException(
                        "No valid material records found in the CSV file."
                );
            }

            materialRepository.saveAll(materials);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to upload materials: "
                            + e.getMessage(),
                    e
            );
        }
    }


    // ==================================================
    // APPROVE MATERIAL
    // ==================================================

    public MaterialResponseDTO approveMaterial(
            Long id,
            String reviewedBy,
            String reviewRemarks) {

        Material material = materialRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Material not found with ID: " + id
                        )
                );

        // ------------------------------------------
        // Generate National Material Code
        // ------------------------------------------

        String nationalCode =
                generateNationalMaterialCode(material);

        material.setStatus("APPROVED");

        material.setNationalMaterialCode(nationalCode);

        material.setReviewedBy(
                reviewedBy != null && !reviewedBy.isBlank()
                        ? reviewedBy
                        : "Admin"
        );

        material.setReviewRemarks(reviewRemarks);

        Material savedMaterial =
                materialRepository.save(material);

        return convertToResponse(savedMaterial);
    }


    // ==================================================
    // REJECT MATERIAL
    // ==================================================

    public MaterialResponseDTO rejectMaterial(
            Long id,
            String reviewedBy,
            String reviewRemarks) {

        Material material = materialRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Material not found with ID: " + id
                        )
                );

        material.setStatus("REJECTED");

        material.setNationalMaterialCode(null);

        material.setReviewedBy(
                reviewedBy != null && !reviewedBy.isBlank()
                        ? reviewedBy
                        : "Admin"
        );

        material.setReviewRemarks(reviewRemarks);

        Material savedMaterial =
                materialRepository.save(material);

        return convertToResponse(savedMaterial);
    }


    // ==================================================
    // GENERATE NATIONAL MATERIAL CODE
    // ==================================================

    private String generateNationalMaterialCode(
            Material material) {

        /*
         * Example:
         *
         * Material Type = STEEL
         * Material Group = BOLT
         *
         * Generated:
         *
         * NMC-STEEL-BOLT-25
         */

        String type = cleanCodePart(
                material.getMaterialType()
        );

        String group = cleanCodePart(
                material.getMaterialGroup()
        );

        if (type.isEmpty()) {
            type = "GEN";
        }

        if (group.isEmpty()) {
            group = "MAT";
        }

        return "NMC-"
                + type
                + "-"
                + group
                + "-"
                + material.getId();
    }


    // ==================================================
    // CLEAN CODE PART
    // ==================================================

    private String cleanCodePart(String value) {

        if (value == null || value.isBlank()) {
            return "";
        }

        return value
                .trim()
                .toUpperCase()
                .replaceAll("[^A-Z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }


    // ==================================================
    // CLEAN CSV VALUE
    // ==================================================

    private String cleanValue(String value) {

        if (value == null) {
            return null;
        }

        return value
                .trim()
                .replaceAll("^\"|\"$", "")
                .trim();
    }


    // ==================================================
    // CONVERT ENTITY → RESPONSE DTO
    // ==================================================

    public MaterialResponseDTO convertToResponse(
            Material material) {

        return new MaterialResponseDTO(

                material.getId(),

                material.getMaterialCode(),

                material.getDescription(),

                material.getMaterialType(),

                material.getMaterialGroup(),

                material.getGrade(),

                material.getSize(),

                material.getStandard(),

                material.getDiameter(),

                material.getLength(),

                material.getUnit(),

                material.getCpseName(),

                // Approval information
                material.getStatus(),

                material.getNationalMaterialCode(),

                material.getReviewedBy(),

                material.getReviewRemarks()
        );
    }
}