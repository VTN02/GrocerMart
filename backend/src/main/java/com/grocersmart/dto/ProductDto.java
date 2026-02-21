package com.grocersmart.dto;

import com.grocersmart.entity.Product;
import lombok.Data;

@Data
public class ProductDto {
    private Long id;
    private String publicId;
    private String name;
    private String category;
    private Product.UnitType unitType;
    private Double bulkQty;
    private Integer unitQty;
    private Double unitPrice;
    private Double bulkPrice;
    private Double purchasePrice;
    private Integer reorderLevel;
    private Integer unitsPerBulk;
    private Product.Status status;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
    private Boolean isDeleted;
    private java.time.LocalDateTime deletedAt;
    private String deletedBy;
}
