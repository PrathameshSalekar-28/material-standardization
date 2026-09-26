package com.materialai.material_standardization.repository;

import com.materialai.material_standardization.entity.ApprovalStatus;
import com.materialai.material_standardization.entity.StandardizedMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StandardizedMaterialRepository
        extends JpaRepository<StandardizedMaterial, Long> {

    List<StandardizedMaterial> findByStatus(
            ApprovalStatus status
    );

    Optional<StandardizedMaterial> findByCommonMaterialCode(
            String commonMaterialCode
    );
}
