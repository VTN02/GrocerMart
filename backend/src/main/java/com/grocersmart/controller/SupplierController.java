package com.grocersmart.controller;

import com.grocersmart.dto.ApiResponse;
import com.grocersmart.dto.SupplierDto;
import com.grocersmart.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.grocersmart.entity.Supplier;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    public ResponseEntity<ApiResponse<SupplierDto>> createSupplier(@RequestBody SupplierDto dto) {
        SupplierDto created = supplierService.createSupplier(dto);
        return ResponseEntity.ok(ApiResponse.success(created, "Supplier created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SupplierDto>>> getAllSuppliers(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) Supplier.Status status) {
        if (id != null) {
            try {
                return ResponseEntity.ok(ApiResponse.success(
                        java.util.Collections.singletonList(supplierService.getSupplierById(id)),
                        "Supplier retrieved successfully"));
            } catch (jakarta.persistence.EntityNotFoundException e) {
                return ResponseEntity.ok(ApiResponse.success(java.util.Collections.emptyList(), "Supplier not found"));
            }
        }
        return ResponseEntity
                .ok(ApiResponse.success(supplierService.getAllSuppliers(status), "Suppliers retrieved successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<SupplierDto>> searchSupplier(@RequestParam Long id) {
        // SupplierService needs a getSupplierById method or similar, but for now we
        // follow the pattern
        return ResponseEntity.ok(ApiResponse.success(supplierService.getSupplierById(id), "Supplier found"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierDto>> updateSupplier(@PathVariable Long id,
            @RequestBody SupplierDto dto) {
        SupplierDto updated = supplierService.updateSupplier(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Supplier updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Supplier deleted successfully"));
    }
}
