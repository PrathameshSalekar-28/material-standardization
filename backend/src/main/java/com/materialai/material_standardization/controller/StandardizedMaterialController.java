package com.materialai.material_standardization.controller;

import com.materialai.material_standardization.entity.ApprovalHistory;
import com.materialai.material_standardization.entity.StandardizedMaterial;
import com.materialai.material_standardization.service.StandardizedMaterialService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/standardized-materials")
@CrossOrigin(origins = "*")
public class StandardizedMaterialController {

    private final StandardizedMaterialService service;

    public StandardizedMaterialController(
            StandardizedMaterialService service) {
        this.service = service;
    }

    // =========================================
    // Create Proposal
    // =========================================

    @PostMapping
    public ResponseEntity<StandardizedMaterial> createProposal(
            @RequestBody StandardizedMaterial material) {

        return ResponseEntity.ok(
                service.createProposal(material)
        );
    }

    // =========================================
    // Get All
    // =========================================

    @GetMapping
    public ResponseEntity<List<StandardizedMaterial>> getAll() {

        return ResponseEntity.ok(
                service.getAll()
        );
    }

    // =========================================
    // Get Pending Review
    // =========================================

    @GetMapping("/pending")
    public ResponseEntity<List<StandardizedMaterial>> getPending() {

        return ResponseEntity.ok(
                service.getPending()
        );
    }

    // =========================================
    // Get Approval History
    // =========================================

    @GetMapping("/history")
    public ResponseEntity<List<ApprovalHistory>> getApprovalHistory() {

        return ResponseEntity.ok(
                service.getApprovalHistory()
        );
    }

    // =========================================
    // Get By ID
    // =========================================

    @GetMapping("/by-id/{id}")
    public ResponseEntity<StandardizedMaterial> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                service.getById(id)
        );
    }

    // =========================================
    // Approve
    // =========================================

    @PostMapping("/by-id/{id}/approve")
    public ResponseEntity<StandardizedMaterial> approve(
            @PathVariable Long id,
            @RequestParam String reviewer) {

        return ResponseEntity.ok(
                service.approve(id, reviewer)
        );
    }

    // =========================================
    // Reject
    // =========================================

    @PostMapping("/by-id/{id}/reject")
    public ResponseEntity<StandardizedMaterial> reject(
            @PathVariable Long id,
            @RequestParam String reviewer) {

        return ResponseEntity.ok(
                service.reject(id, reviewer)
        );
    }
}