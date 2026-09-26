package com.materialai.material_standardization.repository;

import com.materialai.material_standardization.entity.Material;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialRepository extends JpaRepository<Material, Long> {

}