package com.materialai.material_standardization.service;

import com.materialai.material_standardization.entity.Material;
import com.materialai.material_standardization.repository.MaterialRepository;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class CsvUploadService {

    private final MaterialRepository materialRepository;

    public CsvUploadService(MaterialRepository materialRepository) {
        this.materialRepository = materialRepository;
    }

    public int uploadCsv(MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("CSV file is empty");
        }

        List<Material> materials = new ArrayList<>();

        try (
                InputStreamReader reader =
                        new InputStreamReader(
                                file.getInputStream(),
                                StandardCharsets.UTF_8
                        );

                CSVParser csvParser = CSVParser.parse(
                        reader,
                        CSVFormat.DEFAULT.builder()
                                .setHeader()
                                .setSkipHeaderRecord(true)
                                .build()
                )
        ) {

            for (CSVRecord record : csvParser) {

                Material material = new Material();

                material.setCpseName(record.get("cpseName"));
                material.setMaterialCode(record.get("materialCode"));
                material.setDescription(record.get("description"));
                material.setMaterialType(record.get("materialType"));
                material.setMaterialGroup(record.get("materialGroup"));
                material.setGrade(record.get("grade"));
                material.setSize(record.get("size"));
                material.setStandard(record.get("standard"));
                material.setUnit(record.get("unit"));

                materials.add(material);
            }
        }

        materialRepository.saveAll(materials);

        return materials.size();
    }
}
