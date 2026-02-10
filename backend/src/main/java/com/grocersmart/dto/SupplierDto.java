package com.grocersmart.dto;

import com.grocersmart.entity.Supplier;
import lombok.Data;

@Data
public class SupplierDto {
    private Long id;
    private String name;
    private String phone;
    private String address;
    private String email;
    private Supplier.Status status;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}
