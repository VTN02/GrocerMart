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

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(chequeService.getSummary(), "Summary retrieved"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<ChequeDto>>> getAllCheques(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String publicId,
            @RequestParam(required = false) Cheque.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {

        if (publicId != null) {
            try {
                ChequeDto cheque = chequeService.getChequeByPublicId(publicId);
                org.springframework.data.domain.Page<ChequeDto> result = new org.springframework.data.domain.PageImpl<>(
                        java.util.Collections.singletonList(cheque),
                        org.springframework.data.domain.PageRequest.of(0, 1), 1);
                return ResponseEntity.ok(ApiResponse.success(result, "Cheque retrieved successfully"));
            } catch (jakarta.persistence.EntityNotFoundException e) {
                return ResponseEntity
                        .ok(ApiResponse.success(org.springframework.data.domain.Page.empty(), "Cheque not found"));
            }
        }

        String[] sortParts = sort.split(",");
        org.springframework.data.domain.Sort sortObj = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("desc")
                ? org.springframework.data.domain.Sort.by(sortParts[0]).descending()
                : org.springframework.data.domain.Sort.by(sortParts[0]).ascending();

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                sortObj);
        org.springframework.data.jpa.domain.Specification<Cheque> spec = com.grocersmart.specification.ChequeSpecification
                .filterBy(search, status);

        return ResponseEntity
                .ok(ApiResponse.success(chequeService.getCheques(spec, pageable), "Cheques retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ChequeDto>> getCheque(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(chequeService.getChequeById(id), "Cheque retrieved successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<ChequeDto>> searchCheque(@RequestParam(required = false) Long id,
            @RequestParam(required = false) String publicId) {
        ChequeDto cheque = null;
        if (id != null) {
            cheque = chequeService.getChequeById(id);
        } else if (publicId != null) {
            cheque = chequeService.getChequeByPublicId(publicId);
        }
        if (cheque == null) {
            throw new jakarta.persistence.EntityNotFoundException("Cheque not found");
        }
        return ResponseEntity.ok(ApiResponse.success(cheque, "Cheque found"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ChequeDto>> updateCheque(@PathVariable Long id, @RequestBody ChequeDto dto) {
        ChequeDto updated = chequeService.updateCheque(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cheque updated successfully"));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ChequeDto>> updateStatus(@PathVariable Long id,
            @RequestBody ChequeDto statusDto) {
        ChequeDto updated = chequeService.updateStatus(id, statusDto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Cheque status updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCheque(@PathVariable Long id) {
        chequeService.deleteCheque(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Cheque deleted successfully"));
    }
}
