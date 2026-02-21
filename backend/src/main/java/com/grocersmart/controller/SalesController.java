package com.grocersmart.controller;

import com.grocersmart.dto.DailySalesStatsDto;
import com.grocersmart.dto.SalesRecordDto;
import com.grocersmart.dto.TopProductStatsDto;
import com.grocersmart.service.SalesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SalesController {

    private final SalesService salesService;

    @Autowired
    public SalesController(SalesService salesService) {
        this.salesService = salesService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalesRecordDto> createSalesRecord(@RequestBody SalesRecordDto dto) {
        return new ResponseEntity<>(salesService.createSalesRecord(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalesRecordDto> getSalesRecord(@PathVariable Long id) {
        return ResponseEntity.ok(salesService.getSalesRecord(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalesRecordDto> updateSalesRecord(@PathVariable Long id, @RequestBody SalesRecordDto dto) {
        return ResponseEntity.ok(salesService.updateSalesRecord(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSalesRecord(@PathVariable Long id) {
        salesService.deleteSalesRecord(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.grocersmart.dto.ApiResponse<org.springframework.data.domain.Page<SalesRecordDto>>> getSalesRecords(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String publicId,
            @RequestParam(required = false) com.grocersmart.entity.SalesRecord.PaymentMethod method,
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {

        String[] sortParts = sort.split(",");
        org.springframework.data.domain.Sort sortObj = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("desc")
                ? org.springframework.data.domain.Sort.by(sortParts[0]).descending()
                : org.springframework.data.domain.Sort.by(sortParts[0]).ascending();

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                sortObj);

        if (publicId != null) {
            try {
                SalesRecordDto record = salesService.getSalesRecordByPublicId(publicId);
                return ResponseEntity.ok(com.grocersmart.dto.ApiResponse.success(
                        new org.springframework.data.domain.PageImpl<>(java.util.Collections.singletonList(record),
                                pageable, 1),
                        "Sales record retrieved successfully"));
            } catch (jakarta.persistence.EntityNotFoundException e) {
                return ResponseEntity.ok(com.grocersmart.dto.ApiResponse
                        .success(org.springframework.data.domain.Page.empty(pageable), "Sales record not found"));
            }
        }

        return ResponseEntity.ok(com.grocersmart.dto.ApiResponse.success(
                salesService.getSalesRecords(search, method, from, to, pageable),
                "Sales records retrieved successfully"));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SalesRecordDto> searchSalesRecord(@RequestParam String publicId) {
        return ResponseEntity.ok(salesService.getSalesRecordByPublicId(publicId));
    }

    @GetMapping("/analytics/daily")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DailySalesStatsDto>> getDailyStats(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to) {
        if (from == null)
            from = LocalDate.now().minusDays(30);
        if (to == null)
            to = LocalDate.now();
        return ResponseEntity.ok(salesService.getDailySalesStats(from, to));
    }

    @GetMapping("/analytics/top-products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TopProductStatsDto>> getTopProducts(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(defaultValue = "10") int limit) {
        if (from == null)
            from = LocalDate.now().minusDays(30);
        if (to == null)
            to = LocalDate.now();
        return ResponseEntity.ok(salesService.getTopProducts(from, to, limit));
    }
}
