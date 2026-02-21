package com.grocersmart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopProductStatsDto {
    private Long productId;
    private String productName;
    private Long totalQtySold;
    private BigDecimal totalRevenue;
}
