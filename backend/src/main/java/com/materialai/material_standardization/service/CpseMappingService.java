package com.materialai.material_standardization.service;

import com.materialai.material_standardization.entity.CpseMapping;
import com.materialai.material_standardization.entity.CpseMappingHistory;
import com.materialai.material_standardization.entity.MappingStatus;
import com.materialai.material_standardization.repository.CpseMappingHistoryRepository;
import com.materialai.material_standardization.repository.CpseMappingRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CpseMappingService {

    private final CpseMappingRepository repository;
    private final CpseMappingHistoryRepository historyRepository;

    public CpseMappingService(
            CpseMappingRepository repository,
            CpseMappingHistoryRepository historyRepository) {

        this.repository = repository;
        this.historyRepository = historyRepository;
    }

    public CpseMapping createMapping(
            CpseMapping mapping) {

        if (mapping.getStatus() == null) {
            mapping.setStatus(
                    MappingStatus.AI_SUGGESTED
            );
        }

        return repository.save(mapping);
    }

    public List<CpseMapping> getAllMappings() {

        return repository.findAll();
    }

    public List<CpseMapping> getByCpse(
            String cpseName) {

        return repository.findByCpseName(cpseName);
    }

    public List<CpseMapping> getByStatus(
            MappingStatus status) {

        return repository.findByStatus(status);
    }

    public CpseMapping getById(Long id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "CPSE mapping not found with ID: "
                                        + id
                        )
                );
    }

    public CpseMapping approve(
            Long id,
            String reviewer) {

        CpseMapping mapping = getById(id);

        LocalDateTime reviewTime =
                LocalDateTime.now();

        mapping.setStatus(
                MappingStatus.APPROVED
        );

        mapping.setReviewedBy(reviewer);
        mapping.setReviewedAt(reviewTime);

        CpseMapping savedMapping =
                repository.save(mapping);

        saveHistory(
                savedMapping,
                MappingStatus.APPROVED,
                reviewer,
                reviewTime
        );

        return savedMapping;
    }

    public CpseMapping reject(
            Long id,
            String reviewer) {

        CpseMapping mapping = getById(id);

        LocalDateTime reviewTime =
                LocalDateTime.now();

        mapping.setStatus(
                MappingStatus.REJECTED
        );

        mapping.setReviewedBy(reviewer);
        mapping.setReviewedAt(reviewTime);

        CpseMapping savedMapping =
                repository.save(mapping);

        saveHistory(
                savedMapping,
                MappingStatus.REJECTED,
                reviewer,
                reviewTime
        );

        return savedMapping;
    }

    // Get complete CPSE mapping governance history
    public List<CpseMappingHistory> getHistory() {

        return historyRepository
                .findAllByOrderByReviewedAtDesc();
    }

    // Save approval/rejection audit record
    private void saveHistory(
            CpseMapping mapping,
            MappingStatus action,
            String reviewer,
            LocalDateTime reviewTime) {

        CpseMappingHistory history =
                new CpseMappingHistory();

        history.setCpseMappingId(
                mapping.getId()
        );

        history.setCpseName(
                mapping.getCpseName()
        );

        history.setLegacyMaterialCode(
                mapping.getLegacyMaterialCode()
        );

        history.setLegacyDescription(
                mapping.getLegacyDescription()
        );

        history.setCommonMaterialCode(
                mapping.getCommonMaterialCode()
        );

        history.setMatchConfidence(
                mapping.getMatchConfidence()
        );

        history.setMatchReason(
                mapping.getMatchReason()
        );

        history.setAction(action);

        history.setReviewedBy(
                reviewer
        );

        history.setReviewedAt(
                reviewTime
        );

        historyRepository.save(history);
    }
}

