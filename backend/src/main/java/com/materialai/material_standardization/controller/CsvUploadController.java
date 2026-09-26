package com.materialai.material_standardization.controller;

import com.materialai.material_standardization.service.CsvUploadService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = "*")
public class CsvUploadController {

    private final CsvUploadService csvUploadService;

    public CsvUploadController(CsvUploadService csvUploadService) {
        this.csvUploadService = csvUploadService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadCsv(
            @RequestParam("file") MultipartFile file) {

        try {

            int count = csvUploadService.uploadCsv(file);

            return ResponseEntity.ok(
                    count + " materials uploaded successfully"
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body("CSV upload failed: " + e.getMessage());
        }
    }
}