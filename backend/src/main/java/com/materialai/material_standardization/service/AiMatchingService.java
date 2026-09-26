package com.materialai.material_standardization.service;

import com.materialai.material_standardization.client.AiMatchingClient;
import com.materialai.material_standardization.dto.MaterialResponseDTO;
import com.materialai.material_standardization.repository.MaterialRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiMatchingService {

    private final MaterialRepository materialRepository;
    private final MaterialService materialService;
    private final AiMatchingClient aiMatchingClient;

    public AiMatchingService(
            MaterialRepository materialRepository,
            MaterialService materialService,
            AiMatchingClient aiMatchingClient) {

        this.materialRepository = materialRepository;
        this.materialService = materialService;
        this.aiMatchingClient = aiMatchingClient;
    }


    // =========================================
    // Individual Material Matching
    // =========================================

    public AiMatchingClient.AiMatchResponse findMatches(
            Long materialId,
            int topN) {

        MaterialResponseDTO target =
                materialRepository.findById(materialId)
                        .map(materialService::convertToResponse)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Material not found with ID: "
                                                + materialId
                                )
                        );

        List<MaterialResponseDTO> materials =
                materialService.getAllMaterials();

        return aiMatchingClient.findMatches(
                target,
                materials,
                topN
        );
    }


    // =========================================
    // Duplicate Detection
    // =========================================

    public AiMatchingClient.DuplicateResponse findDuplicates() {

        List<MaterialResponseDTO> materials =
                materialService.getAllMaterials();

        return aiMatchingClient.findDuplicates(
                materials
        );
    }
}