package com.grocersmart.dto;

import com.grocersmart.entity.CreditCustomer;
import lombok.Data;

@Data
public class CreditCustomerDto {
    private Long id;
    private String publicId;
    private String name;
    private String phone;
    private String address;
    private Double creditLimit;
    private Double outstandingBalance;
    private Double availableCredit;
    private Integer paymentTermsDays;
    private Double authorizedThreshold;

    // AI / Risk Stats
    private CreditCustomer.CustomerType customerType;
    private Double totalPurchases;
    private Double totalPaid;
    private java.time.LocalDate lastPaymentDate;

    private CreditCustomer.Status status;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}
