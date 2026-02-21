package com.grocersmart.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class SalesItemDto {
    private Long id;
    private Long salesRecordId;
    private Long productId;
    private String productName; // For display
    private Integer qtySold;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;

    // AI Snapshots
    private String productNameSnapshot;
    private String categorySnapshot;
    private String unitOrBulk;
    private Boolean promotionApplied;
    private BigDecimal discountAmount;
}
