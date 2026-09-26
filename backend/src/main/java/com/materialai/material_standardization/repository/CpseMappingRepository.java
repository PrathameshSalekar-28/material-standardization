package com.materialai.material_standardization.repository;

import com.materialai.material_standardization.entity.CpseMapping;
import com.materialai.material_standardization.entity.MappingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CpseMappingRepository
        extends JpaRepository<CpseMapping, Long> {

    List<CpseMapping> findByCpseName(String cpseName);

    List<CpseMapping> findByStatus(MappingStatus status);

    List<CpseMapping> findByCpseNameAndStatus(
            String cpseName,
            MappingStatus status
    );
}