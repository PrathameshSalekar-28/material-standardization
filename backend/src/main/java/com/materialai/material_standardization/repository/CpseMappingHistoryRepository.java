package com.materialai.material_standardization.repository;

import com.materialai.material_standardization.entity.CpseMappingHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CpseMappingHistoryRepository
        extends JpaRepository<CpseMappingHistory, Long> {

    List<CpseMappingHistory>
    findAllByOrderByReviewedAtDesc();
}