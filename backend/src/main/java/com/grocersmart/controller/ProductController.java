package com.grocersmart.controller;

import com.grocersmart.dto.ApiResponse;
import com.grocersmart.dto.ProductDto;
import com.grocersmart.service.ProductService;
import lombok.RequiredArgsConstructor;
import com.grocersmart.dto.CsvImportResultDTO;
import com.grocersmart.service.ProductImportService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.grocersmart.entity.Product;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductImportService importService;

    @PostMapping("/bulk-import")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CsvImportResultDTO>> importProductsCsv(@RequestParam("file") MultipartFile file) {
        CsvImportResultDTO result = importService.importFromCsv(file);
        if (result.isSuccess()) {
            return ResponseEntity.ok(ApiResponse.success(result, result.getMessage()));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error(result.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@RequestBody ProductDto dto) {
        ProductDto created = productService.createProduct(dto);
        return ResponseEntity.ok(ApiResponse.success(created, "Product created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductDto>>> getProducts(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Product.Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (id != null) {
            try {
                ProductDto product = productService.getProductById(id);
                Page<ProductDto> productPage = new org.springframework.data.domain.PageImpl<>(
                        java.util.Collections.singletonList(product),
                        PageRequest.of(0, 1),
                        1);
                return ResponseEntity.ok(ApiResponse.success(productPage, "Product retrieved successfully"));
            } catch (jakarta.persistence.EntityNotFoundException e) {
                return ResponseEntity
                        .ok(ApiResponse.success(org.springframework.data.domain.Page.empty(), "Product not found"));
            }
        }
        Page<ProductDto> products = productService.getProducts(category, status, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(products, "Products retrieved successfully"));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getAllProducts() {
        return ResponseEntity
                .ok(ApiResponse.success(productService.getAllProducts(), "All products retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProduct(@PathVariable Long id) {
        return ResponseEntity
                .ok(ApiResponse.success(productService.getProductById(id), "Product retrieved successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<ProductDto>> searchProduct(@RequestParam Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id), "Product found"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(@PathVariable Long id, @RequestBody ProductDto dto) {
        ProductDto updated = productService.updateProduct(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Product updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Product deleted successfully"));
    }
}
