package com.materialai.material_standardization.client;

import com.materialai.material_standardization.dto.MaterialResponseDTO;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class AiMatchingClient {

    private final RestClient restClient;

    public AiMatchingClient() {

        this.restClient = RestClient.builder()
                .baseUrl(System.getenv().getOrDefault(
                        "AI_SERVICE_URL",
                        "http://localhost:8000"
                        ))
                .build();
    }


    // =========================================
    // Individual Material Matching
    // =========================================

    public AiMatchResponse findMatches(
            MaterialResponseDTO target,
            List<MaterialResponseDTO> materials,
            int topN) {

        AiMatchRequest request = new AiMatchRequest(
                target,
                materials,
                topN
        );

        return restClient.post()
                .uri("/match")
                .body(request)
                .retrieve()
                .body(AiMatchResponse.class);
    }


    // =========================================
    // Duplicate Detection
    // =========================================

    public DuplicateResponse findDuplicates(
            List<MaterialResponseDTO> materials) {

        DuplicateRequest request =
                new DuplicateRequest(materials);

        return restClient.post()
                .uri("/duplicates")
                .body(request)
                .retrieve()
                .body(DuplicateResponse.class);
    }


    // =========================================
    // Request - Matching
    // =========================================

    public record AiMatchRequest(
            MaterialResponseDTO target,
            List<MaterialResponseDTO> materials,
            int top_n
    ) {
    }


    // =========================================
    // Response - Matching
    // =========================================

    public record AiMatchResponse(
            MaterialResponseDTO target,
            List<AiMatchResult> matches
    ) {
    }


    // =========================================
    // Match Result
    // =========================================

    public record AiMatchResult(

            String materialCode,
            String cpseName,
            String description,
            String materialType,
            String materialGroup,
            String grade,
            String size,
            String standard,
            String unit,

            double similarity,

            String matchType,

            List<String> matchReasons
    ) {
    }


    // =========================================
    // Request - Duplicate Detection
    // =========================================

    public record DuplicateRequest(
            List<MaterialResponseDTO> materials
    ) {
    }


    // =========================================
    // Response - Duplicate Detection
    // =========================================

    public record DuplicateResponse(

            int totalMaterials,

            List<DuplicateGroup> duplicateGroups
    ) {
    }


    // =========================================
    // Duplicate Group
    // =========================================

    public record DuplicateGroup(

            String groupId,

            int materialCount,

            double highestSimilarity,

            List<DuplicateMaterial> materials,

            List<MatchingPair> matchingPairs
    ) {
    }


    // =========================================
    // Duplicate Material
    // =========================================

    public record DuplicateMaterial(

            String materialCode,
            String cpseName,
            String description,
            String materialType,
            String materialGroup,
            String grade,
            String size,
            String standard,
            String unit
    ) {
    }


    // =========================================
    // Matching Pair
    // =========================================

    public record MatchingPair(

            String materialCode1,
            String cpseName1,
            String description1,

            String materialCode2,
            String cpseName2,
            String description2,

            double similarity,

            String matchType,

            List<String> matchReasons
    ) {
    }
}