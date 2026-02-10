package com.grocersmart.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreditPaymentDto {
    private Long id;
    private Long customerId;
    private Double amount;
    private LocalDateTime paymentDate;
    private String note;
}
