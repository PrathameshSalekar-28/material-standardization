package com.materialai.material_standardization.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException ex) {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("status", 400);
        response.put("error", "Standardization Validation Error");
        response.put("message", getSafeMessage(ex));

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(
            Exception ex) {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("status", 500);
        response.put("error", "Internal Server Error");
        response.put("message", getSafeMessage(ex));

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }

    private String getSafeMessage(Exception ex) {

        if (ex.getMessage() != null
                && !ex.getMessage().isBlank()) {

            return ex.getMessage();
        }

        if (ex.getCause() != null
                && ex.getCause().getMessage() != null
                && !ex.getCause().getMessage().isBlank()) {

            return ex.getCause().getMessage();
        }

        return "An unexpected server error occurred.";
    }
}