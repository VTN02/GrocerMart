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

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<java.util.Map<String, Long>>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getSummary(), "Summary retrieved"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SupplierDto>> createSupplier(@RequestBody SupplierDto dto) {
        SupplierDto created = supplierService.createSupplier(dto);
        return ResponseEntity.ok(ApiResponse.success(created, "Supplier created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<SupplierDto>>> getAllSuppliers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String publicId,
            @RequestParam(required = false) Supplier.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {

        if (publicId != null) {
            try {
                SupplierDto supplier = supplierService.getSupplierByPublicId(publicId);
                org.springframework.data.domain.Page<SupplierDto> result = new org.springframework.data.domain.PageImpl<>(
                        java.util.Collections.singletonList(supplier),
                        org.springframework.data.domain.PageRequest.of(0, 1), 1);
                return ResponseEntity.ok(ApiResponse.success(result, "Supplier retrieved successfully"));
            } catch (jakarta.persistence.EntityNotFoundException e) {
                return ResponseEntity
                        .ok(ApiResponse.success(org.springframework.data.domain.Page.empty(), "Supplier not found"));
            }
        }

        String[] sortParts = sort.split(",");
        org.springframework.data.domain.Sort sortObj = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("desc")
                ? org.springframework.data.domain.Sort.by(sortParts[0]).descending()
                : org.springframework.data.domain.Sort.by(sortParts[0]).ascending();

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                sortObj);
        org.springframework.data.jpa.domain.Specification<Supplier> spec = com.grocersmart.specification.SupplierSpecification
                .filterBy(search, status);

        return ResponseEntity.ok(
                ApiResponse.success(supplierService.getSuppliers(spec, pageable), "Suppliers retrieved successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<SupplierDto>> searchSupplier(@RequestParam(required = false) Long id,
            @RequestParam(required = false) String publicId) {
        SupplierDto supplier = null;
        if (id != null) {
            supplier = supplierService.getSupplierById(id);
        } else if (publicId != null) {
            supplier = supplierService.getSupplierByPublicId(publicId);
        }
        if (supplier == null) {
            throw new jakarta.persistence.EntityNotFoundException("Supplier not found");
        }
        return ResponseEntity.ok(ApiResponse.success(supplier, "Supplier found"));
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
