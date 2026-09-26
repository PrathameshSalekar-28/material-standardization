package com.materialai.material_standardization.service;

import com.materialai.material_standardization.entity.ApprovalHistory;
import com.materialai.material_standardization.entity.ApprovalStatus;
import com.materialai.material_standardization.entity.StandardizedMaterial;
import com.materialai.material_standardization.entity.Material;
import com.materialai.material_standardization.entity.CpseMapping;
import com.materialai.material_standardization.entity.MappingStatus;
import com.materialai.material_standardization.client.AiMatchingClient;
import com.materialai.material_standardization.repository.ApprovalHistoryRepository;
import com.materialai.material_standardization.repository.StandardizedMaterialRepository;
import com.materialai.material_standardization.repository.MaterialRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class StandardizedMaterialService {

    private final StandardizedMaterialRepository repository;
    private final ApprovalHistoryRepository approvalHistoryRepository;
    private final MaterialRepository materialRepository;
    private final CpseMappingService cpseMappingService;
    private final AiMatchingService aiMatchingService;

    public StandardizedMaterialService(
            StandardizedMaterialRepository repository,
            ApprovalHistoryRepository approvalHistoryRepository,
            MaterialRepository materialRepository,
            CpseMappingService cpseMappingService,
            AiMatchingService aiMatchingService) {

        this.repository = repository;
        this.approvalHistoryRepository = approvalHistoryRepository;
        this.materialRepository = materialRepository;
        this.cpseMappingService = cpseMappingService;
        this.aiMatchingService = aiMatchingService;
    }

    public StandardizedMaterial createProposal(
            StandardizedMaterial material) {

        Optional<StandardizedMaterial> existing =
                repository.findByCommonMaterialCode(
                        material.getCommonMaterialCode()
                );

        if (existing.isPresent()) {
            return existing.get();
        }

        material.setId(null);
        material.setStatus(ApprovalStatus.PENDING_REVIEW);
        material.setReviewedBy(null);
        material.setReviewedAt(null);

        return repository.save(material);
    }

    public List<StandardizedMaterial> getAll() {
        return repository.findAll();
    }

    public List<StandardizedMaterial> getPending() {

        return repository.findByStatus(
                ApprovalStatus.PENDING_REVIEW
        );
    }

    public StandardizedMaterial getById(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Standardized material not found with ID: "
                                        + id
                        )
                );
    }

    public StandardizedMaterial approve(
            Long id,
            String reviewer) {

        StandardizedMaterial material = getById(id);

        LocalDateTime reviewTime = LocalDateTime.now();

        material.setStatus(ApprovalStatus.APPROVED);
        material.setReviewedBy(reviewer);
        material.setReviewedAt(reviewTime);

        StandardizedMaterial savedMaterial =
                repository.save(material);

        ApprovalHistory history = new ApprovalHistory();

        history.setStandardizedMaterialId(
                savedMaterial.getId()
        );

        history.setCommonMaterialCode(
                savedMaterial.getCommonMaterialCode()
        );

        history.setStandardizedDescription(
                savedMaterial.getStandardizedDescription()
        );

        history.setAction(
                ApprovalStatus.APPROVED
        );

        history.setReviewedBy(reviewer);
        history.setReviewedAt(reviewTime);

        approvalHistoryRepository.save(history);

        // Create AI-based CPSE mapping suggestions
        createCpseMappingSuggestions(savedMaterial);

        return savedMaterial;
    }

    public StandardizedMaterial reject(
            Long id,
            String reviewer) {

        StandardizedMaterial material = getById(id);

        LocalDateTime reviewTime = LocalDateTime.now();

        material.setStatus(ApprovalStatus.REJECTED);
        material.setReviewedBy(reviewer);
        material.setReviewedAt(reviewTime);

        StandardizedMaterial savedMaterial =
                repository.save(material);

        ApprovalHistory history = new ApprovalHistory();

        history.setStandardizedMaterialId(
                savedMaterial.getId()
        );

        history.setCommonMaterialCode(
                savedMaterial.getCommonMaterialCode()
        );

        history.setStandardizedDescription(
                savedMaterial.getStandardizedDescription()
        );

        history.setAction(
                ApprovalStatus.REJECTED
        );

        history.setReviewedBy(reviewer);
        history.setReviewedAt(reviewTime);

        approvalHistoryRepository.save(history);

        return savedMaterial;
    }

    public List<ApprovalHistory> getApprovalHistory() {

        return approvalHistoryRepository
                .findAllByOrderByReviewedAtDesc();
    }

    /**
     * Creates AI-suggested CPSE mappings after
     * a National Material Code is approved.
     *
     * The mapping confidence comes from the actual
     * AI duplicate detection similarity score.
     */
    private void createCpseMappingSuggestions(
            StandardizedMaterial standardizedMaterial) {

        List<Material> materials =
                materialRepository.findAll();

        /*
         * Run AI duplicate detection once.
         *
         * The response contains MatchingPair objects
         * with the actual AI similarity score.
         */
        var duplicateResponse =
                aiMatchingService.findDuplicates();

        for (Material material : materials) {

            if (!isMatchingMaterial(
                    material,
                    standardizedMaterial)) {
                continue;
            }

            // Prevent duplicate mappings
            boolean alreadyExists =
                    cpseMappingService.getAllMappings()
                            .stream()
                            .anyMatch(mapping ->
                                    standardizedMaterial
                                            .getCommonMaterialCode()
                                            .equals(
                                                    mapping.getCommonMaterialCode()
                                            )
                                    &&
                                    material.getMaterialCode()
                                            .equals(
                                                    mapping.getLegacyMaterialCode()
                                            )
                            );

            if (alreadyExists) {
                continue;
            }

            /*
             * Find the actual AI similarity score
             * for this material from the duplicate groups.
             */
            Double aiConfidence =
                    findAiSimilarity(
                            material.getMaterialCode(),
                            duplicateResponse
                    );

            /*
             * If AI did not identify this material
             * as part of a duplicate pair, do not
             * create a fake confidence value.
             */
            if (aiConfidence == null) {
                continue;
            }

            CpseMapping mapping = new CpseMapping();

            mapping.setCpseName(
                    material.getCpseName()
            );

            mapping.setLegacyMaterialCode(
                    material.getMaterialCode()
            );

            mapping.setLegacyDescription(
                    material.getDescription()
            );

            mapping.setCommonMaterialCode(
                    standardizedMaterial
                            .getCommonMaterialCode()
            );

            // Actual AI similarity
            mapping.setMatchConfidence(
                    aiConfidence
            );

            mapping.setMatchReason(
                    "AI duplicate detection identified this material "
                    + "as equivalent with "
                    + String.format("%.2f", aiConfidence)
                    + "% similarity."
            );

            // Mapping requires Admin approval
            mapping.setStatus(
                    MappingStatus.AI_SUGGESTED
            );

            cpseMappingService.createMapping(mapping);
        }
    }

    /**
     * Finds the highest AI similarity score for
     * a material from all duplicate matching pairs.
     */
    private Double findAiSimilarity(
            String materialCode,
            AiMatchingClient.DuplicateResponse duplicateResponse) {

        if (duplicateResponse == null
                || duplicateResponse.duplicateGroups() == null) {
            return null;
        }

        Double highestSimilarity = null;

        for (var group :
                duplicateResponse.duplicateGroups()) {

            if (group.matchingPairs() == null) {
                continue;
            }

            for (var pair :
                    group.matchingPairs()) {

                boolean materialMatches =
                        materialCode.equals(
                                pair.materialCode1()
                        )
                        ||
                        materialCode.equals(
                                pair.materialCode2()
                        );

                if (!materialMatches) {
                    continue;
                }

                double similarity =
                        pair.similarity();

                if (highestSimilarity == null
                        || similarity > highestSimilarity) {

                    highestSimilarity = similarity;
                }
            }
        }

        return highestSimilarity;
    }

    /**
     * Checks whether an existing material belongs
     * to the approved standardized material.
     */
    private boolean isMatchingMaterial(
            Material material,
            StandardizedMaterial standardizedMaterial) {

        return equalsIgnoreCase(
                    material.getMaterialType(),
                    standardizedMaterial.getMaterialType()
                )
                &&
                equalsIgnoreCase(
                    material.getMaterialGroup(),
                    standardizedMaterial.getMaterialGroup()
                )
                &&
                equalsIgnoreCase(
                    material.getGrade(),
                    standardizedMaterial.getGrade()
                )
                &&
                equalsIgnoreCase(
                    material.getSize(),
                    standardizedMaterial.getSize()
                )
                &&
                equalsIgnoreCase(
                    material.getStandard(),
                    standardizedMaterial.getStandard()
                );
    }

    private boolean equalsIgnoreCase(
            String first,
            String second) {

        if (first == null || second == null) {
            return first == null && second == null;
        }

        return first.trim()
                .equalsIgnoreCase(second.trim());
    }
}