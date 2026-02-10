package com.grocersmart.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StockConversionDto {
    private Long productId;
    private Double fromBulkQty;
    private Integer toUnitQty;
    private String note;
    private LocalDateTime conversionDate;
}
