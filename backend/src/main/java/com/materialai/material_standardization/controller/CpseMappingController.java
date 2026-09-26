package com.materialai.material_standardization.controller;

import com.materialai.material_standardization.entity.CpseMapping;
import com.materialai.material_standardization.entity.CpseMappingHistory;
import com.materialai.material_standardization.entity.MappingStatus;
import com.materialai.material_standardization.service.CpseMappingService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cpse-mappings")
@CrossOrigin(origins = "*")
public class CpseMappingController {

    private final CpseMappingService service;

    public CpseMappingController(
            CpseMappingService service) {

        this.service = service;
    }

    // =========================
    // CREATE MAPPING
    // =========================
    @PostMapping
    public ResponseEntity<CpseMapping> createMapping(
            @RequestBody CpseMapping mapping) {

        return ResponseEntity.ok(
                service.createMapping(mapping)
        );
    }

    // =========================
    // GET ALL MAPPINGS
    // =========================
    @GetMapping
    public ResponseEntity<List<CpseMapping>> getAllMappings() {

        return ResponseEntity.ok(
                service.getAllMappings()
        );
    }

    // =========================
    // GET PENDING MAPPINGS
    // =========================
    @GetMapping("/pending")
    public ResponseEntity<List<CpseMapping>> getPendingMappings() {

        return ResponseEntity.ok(
                service.getByStatus(MappingStatus.AI_SUGGESTED)
        );
    }

    // =========================
    // GET MAPPINGS BY CPSE
    // =========================
    @GetMapping("/cpse/{cpseName}")
    public ResponseEntity<List<CpseMapping>> getByCpse(
            @PathVariable String cpseName) {

        return ResponseEntity.ok(
                service.getByCpse(cpseName)
        );
    }

    // =========================
    // GET MAPPINGS BY STATUS
    // =========================
    @GetMapping("/status/{status}")
    public ResponseEntity<List<CpseMapping>> getByStatus(
            @PathVariable MappingStatus status) {

        return ResponseEntity.ok(
                service.getByStatus(status)
        );
    }

    // =========================
    // GET MAPPING HISTORY
    // =========================
    @GetMapping("/history")
    public ResponseEntity<List<CpseMappingHistory>> getHistory() {

        return ResponseEntity.ok(
                service.getHistory()
        );
    }

    // =========================
    // GET MAPPING BY ID
    // =========================
    @GetMapping("/by-id/{id}")
    public ResponseEntity<CpseMapping> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                service.getById(id)
        );
    }

    // =========================
    // APPROVE MAPPING
    // =========================
    @PostMapping("/by-id/{id}/approve")
    public ResponseEntity<CpseMapping> approve(
            @PathVariable Long id,
            @RequestParam(defaultValue = "Reviewer") String reviewer) {

        return ResponseEntity.ok(
                service.approve(
                        id,
                        reviewer
                )
        );
    }

    // =========================
    // REJECT MAPPING
    // =========================
    @PostMapping("/by-id/{id}/reject")
    public ResponseEntity<CpseMapping> reject(
            @PathVariable Long id,
            @RequestParam(defaultValue = "Reviewer") String reviewer) {

        return ResponseEntity.ok(
                service.reject(
                        id,
                        reviewer
                )
        );
    }
}