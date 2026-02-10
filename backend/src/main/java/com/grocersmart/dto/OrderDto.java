package com.grocersmart.dto;

import com.grocersmart.entity.Order;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDto {
    private Long id;
    private String invoiceNo;
    private LocalDateTime orderDate;
    private Order.PaymentType paymentType;
    private Order.Status status;
    private Double totalAmount;
    private List<OrderItemDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
