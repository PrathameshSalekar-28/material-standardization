package com.materialai.material_standardization.controller;

import com.materialai.material_standardization.dto.StandardizationResponseDTO;
import com.materialai.material_standardization.service.StandardizationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/standardization")
@CrossOrigin(origins = "*")
public class StandardizationController {

    private final StandardizationService standardizationService;

    public StandardizationController(
            StandardizationService standardizationService) {

        this.standardizationService = standardizationService;
    }

    @PostMapping
    public ResponseEntity<StandardizationResponseDTO> standardize(
            @RequestBody List<Long> materialIds) {

        return ResponseEntity.ok(
                standardizationService.standardize(
                        materialIds
                )
        );
    }
}
