package com.materialai.material_standardization.controller;

import com.materialai.material_standardization.dto.MaterialRequestDTO;
import com.materialai.material_standardization.dto.MaterialResponseDTO;
import com.materialai.material_standardization.service.MaterialService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = "*")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }


    // ==================================================
    // CREATE SINGLE MATERIAL
    // ==================================================

    @PostMapping
    public ResponseEntity<MaterialResponseDTO> createMaterial(
            @Valid @RequestBody MaterialRequestDTO request) {

        return new ResponseEntity<>(
                materialService.createMaterial(request),
                HttpStatus.CREATED
        );
    }


    // ==================================================
    // GET ALL MATERIALS
    // ==================================================

    @GetMapping
    public ResponseEntity<List<MaterialResponseDTO>> getAllMaterials() {

        return ResponseEntity.ok(
                materialService.getAllMaterials()
        );
    }


    // ==================================================
    // APPROVE MATERIAL
    // ==================================================

    @PostMapping("/{id}/approve")
    public ResponseEntity<MaterialResponseDTO> approveMaterial(
            @PathVariable Long id,
            @RequestParam(required = false) String reviewedBy,
            @RequestParam(required = false) String reviewRemarks) {

        return ResponseEntity.ok(
                materialService.approveMaterial(
                        id,
                        reviewedBy,
                        reviewRemarks
                )
        );
    }


    // ==================================================
    // REJECT MATERIAL
    // ==================================================

    @PostMapping("/{id}/reject")
    public ResponseEntity<MaterialResponseDTO> rejectMaterial(
            @PathVariable Long id,
            @RequestParam(required = false) String reviewedBy,
            @RequestParam(required = false) String reviewRemarks) {

        return ResponseEntity.ok(
                materialService.rejectMaterial(
                        id,
                        reviewedBy,
                        reviewRemarks
                )
        );
    }
}