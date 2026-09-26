package com.materialai.material_standardization.controller;

import com.materialai.material_standardization.client.AiMatchingClient;
import com.materialai.material_standardization.service.AiMatchingService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiMatchingController {

    private final AiMatchingService aiMatchingService;

    public AiMatchingController(
            AiMatchingService aiMatchingService) {

        this.aiMatchingService = aiMatchingService;
    }


    // =========================================
    // Individual Material Matching
    // =========================================

    @GetMapping("/match/{materialId}")
    public ResponseEntity<AiMatchingClient.AiMatchResponse> findMatches(
            @PathVariable Long materialId,
            @RequestParam(defaultValue = "5") int topN) {

        return ResponseEntity.ok(
                aiMatchingService.findMatches(
                        materialId,
                        topN
                )
        );
    }


    // =========================================
    // Duplicate Material Detection
    // =========================================

    @GetMapping("/duplicates")
    public ResponseEntity<AiMatchingClient.DuplicateResponse> findDuplicates() {

        return ResponseEntity.ok(
                aiMatchingService.findDuplicates()
        );
    }
}