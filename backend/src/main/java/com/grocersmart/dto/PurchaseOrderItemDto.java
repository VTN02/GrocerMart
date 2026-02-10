package com.grocersmart.dto;

import lombok.Data;

@Data
public class PurchaseOrderItemDto {
    private Long id;
    private Long purchaseOrderId;
    private Long productId;
    private Integer qty;
    private Double unitCost;
    private Double lineTotal;
}
