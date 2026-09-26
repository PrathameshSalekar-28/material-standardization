package com.materialai.material_standardization.repository;

import com.materialai.material_standardization.entity.ApprovalHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApprovalHistoryRepository
        extends JpaRepository<ApprovalHistory, Long> {

    List<ApprovalHistory> findAllByOrderByReviewedAtDesc();
}
