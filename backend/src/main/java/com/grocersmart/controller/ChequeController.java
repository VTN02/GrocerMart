package com.grocersmart.controller;

import com.grocersmart.dto.ApiResponse;
import com.grocersmart.dto.ChequeDto;
import com.grocersmart.entity.Cheque;
import com.grocersmart.service.ChequeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cheques")
@RequiredArgsConstructor
public class ChequeController {

    private final ChequeService chequeService;

    @PostMapping
    public ResponseEntity<ApiResponse<ChequeDto>> createCheque(@RequestBody ChequeDto dto) {
        ChequeDto created = chequeService.createCheque(dto);
        return ResponseEntity.ok(ApiResponse.success(created, "Cheque created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ChequeDto>>> getAllCheques(@RequestParam(required = false) Long id) {
        if (id != null) {
            try {
                ChequeDto cheque = chequeService.getChequeById(id);
                return ResponseEntity.ok(ApiResponse.success(java.util.Collections.singletonList(cheque),
                        "Cheque retrieved successfully"));
            } catch (jakarta.persistence.EntityNotFoundException e) {
                return ResponseEntity.ok(ApiResponse.success(java.util.Collections.emptyList(), "Cheque not found"));
            }
        }
        return ResponseEntity.ok(ApiResponse.success(chequeService.getAllCheques(), "Cheques retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ChequeDto>> getCheque(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(chequeService.getChequeById(id), "Cheque retrieved successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<ChequeDto>> searchCheque(@RequestParam Long id) {
        return ResponseEntity.ok(ApiResponse.success(chequeService.getChequeById(id), "Cheque found"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ChequeDto>> updateCheque(@PathVariable Long id, @RequestBody ChequeDto dto) {
        ChequeDto updated = chequeService.updateCheque(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cheque updated successfully"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ChequeDto>> updateStatus(@PathVariable Long id,
            @RequestParam Cheque.Status status) {
        ChequeDto updated = chequeService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cheque status updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCheque(@PathVariable Long id) {
        chequeService.deleteCheque(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Cheque deleted successfully"));
    }
}
