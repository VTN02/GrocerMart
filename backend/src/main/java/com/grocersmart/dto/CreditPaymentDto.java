package com.grocersmart.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreditPaymentDto {
    private Long id;
    private String publicId;
    private Long customerId;
    private Long invoiceId;
    private Double amount;
    private String method; // CASH, CHEQUE, BANK
    private String status;
    private LocalDateTime paymentDate;
    private String note;
}
