package com.grocersmart.dto;

import lombok.Data;

@Data
public class OrderItemDto {
    private Long id;
    private Long orderId;
    private Long productId;
    private Integer qty;
    private Double unitPrice;
    private Double lineTotal;
}
