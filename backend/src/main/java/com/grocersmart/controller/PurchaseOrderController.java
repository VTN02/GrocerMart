package com.grocersmart.controller;

import com.grocersmart.dto.ApiResponse;
import com.grocersmart.dto.PurchaseOrderDto;
import com.grocersmart.dto.PurchaseOrderItemDto;
import com.grocersmart.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService poService;

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> createPO(@RequestBody PurchaseOrderDto dto) {
        PurchaseOrderDto created = poService.createPO(dto);
        return ResponseEntity.ok(ApiResponse.success(created, "Purchase Order created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PurchaseOrderDto>>> getAllPOs(@RequestParam(required = false) Long id,
            @RequestParam(required = false) String publicId) {
        if (id != null) {
            try {
                PurchaseOrderDto po = poService.getPOById(id);
                return ResponseEntity.ok(ApiResponse.success(java.util.Collections.singletonList(po),
                        "Purchase Order retrieved successfully"));
            } catch (jakarta.persistence.EntityNotFoundException e) {
                return ResponseEntity
                        .ok(ApiResponse.success(java.util.Collections.emptyList(), "Purchase Order not found"));
            }
        }
        if (publicId != null) {
            try {
                PurchaseOrderDto po = poService.getPOByPublicId(publicId);
                return ResponseEntity.ok(ApiResponse.success(java.util.Collections.singletonList(po),
                        "Purchase Order retrieved successfully"));
            } catch (jakarta.persistence.EntityNotFoundException e) {
                return ResponseEntity
                        .ok(ApiResponse.success(java.util.Collections.emptyList(), "Purchase Order not found"));
            }
        }
        return ResponseEntity.ok(ApiResponse.success(poService.getAllPOs(), "Purchase Orders retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> getPO(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(poService.getPOById(id), "Purchase Order retrieved successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> searchPO(@RequestParam(required = false) Long id,
            @RequestParam(required = false) String publicId) {
        PurchaseOrderDto dto = null;
        if (id != null) {
            dto = poService.getPOById(id);
        } else if (publicId != null) {
            dto = poService.getPOByPublicId(publicId);
        }
        if (dto == null) {
            throw new jakarta.persistence.EntityNotFoundException("Purchase Order not found");
        }
        return ResponseEntity.ok(ApiResponse.success(dto, "Purchase Order found"));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<ApiResponse<PurchaseOrderItemDto>> addItem(@PathVariable Long id,
            @RequestBody PurchaseOrderItemDto itemDto) {
        PurchaseOrderItemDto added = poService.addItem(id, itemDto);
        return ResponseEntity.ok(ApiResponse.success(added, "Item added successfully"));
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<ApiResponse<List<PurchaseOrderItemDto>>> getItems(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(poService.getItems(id), "Items retrieved successfully"));
    }

    @PutMapping("/{id}/receive")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> receivePO(@PathVariable Long id) {
        PurchaseOrderDto received = poService.receivePO(id);
        return ResponseEntity.ok(ApiResponse.success(received, "Purchase Order received successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePO(@PathVariable Long id) {
        poService.deletePO(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Purchase Order deleted successfully"));
    }
}
