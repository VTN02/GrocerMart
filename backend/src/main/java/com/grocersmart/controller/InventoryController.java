package com.grocersmart.controller;

import com.grocersmart.dto.ApiResponse;
import com.grocersmart.dto.StockConversionDto;
import com.grocersmart.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final ProductService productService;

    @PostMapping("/convert")
    public ResponseEntity<ApiResponse<String>> convertStock(@RequestBody StockConversionDto dto) {
        productService.convertStock(dto);
        return ResponseEntity.ok(ApiResponse.success("Stock converted successfully", "Conversion complete"));
    }
}
