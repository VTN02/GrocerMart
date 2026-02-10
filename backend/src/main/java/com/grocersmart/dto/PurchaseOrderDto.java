package com.grocersmart.dto;

import com.grocersmart.entity.PurchaseOrder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PurchaseOrderDto {
    private Long id;
    private Long supplierId;
    private LocalDateTime poDate;
    private PurchaseOrder.Status status;
    private Double totalAmount;
    private List<PurchaseOrderItemDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
