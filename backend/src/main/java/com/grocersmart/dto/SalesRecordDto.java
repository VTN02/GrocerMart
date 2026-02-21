package com.grocersmart.dto;

import com.grocersmart.entity.SalesRecord.PaymentMethod;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
public class SalesRecordDto {
    private Long id;
    private String publicId;
    private String invoiceId;
    private LocalDate salesDate;
    private BigDecimal totalRevenue;
    private Integer totalItemsSold;
    private PaymentMethod paymentMethod;
    private String note;
    private List<SalesItemDto> items;
    private Long creditCustomerId;

    // AI / Payment Stats
    private String paymentStatus;
    private LocalDate dueDate;
    private BigDecimal paidAmount;
    private Integer daysOverdue;
    private Long cashierId;

    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}
