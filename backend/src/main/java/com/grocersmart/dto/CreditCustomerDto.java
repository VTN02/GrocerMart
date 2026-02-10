package com.grocersmart.dto;

import com.grocersmart.entity.CreditCustomer;
import lombok.Data;

@Data
public class CreditCustomerDto {
    private Long id;
    private String name;
    private String phone;
    private String address;
    private Double creditLimit;
    private Double outstandingBalance;
    private CreditCustomer.Status status;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}
