package com.grocersmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditPaymentResponseDto {
    private Long customerId;
    private Long invoiceId;
    private String publicId;
    private String status;
    private Double paidAmount;
    private Double previousOutstanding;
    private Double newOutstanding;
    private String message;
}
