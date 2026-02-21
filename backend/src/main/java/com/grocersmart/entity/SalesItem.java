package com.grocersmart.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "sales_items")
@Data
@NoArgsConstructor
public class SalesItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_record_id", nullable = false)
    private SalesRecord salesRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Integer qtySold;

    @Column(nullable = false)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private BigDecimal lineTotal;

    @Column(name = "product_name_snapshot")
    private String productNameSnapshot;

    @Column(name = "category_snapshot")
    private String categorySnapshot;

    @Enumerated(EnumType.STRING)
    @Column(name = "unit_or_bulk", nullable = false)
    private com.grocersmart.entity.Product.UnitType unitOrBulk = com.grocersmart.entity.Product.UnitType.UNIT;

    @Column(name = "promotion_applied")
    private Boolean promotionApplied = false;

    @Column(name = "discount_amount")
    private BigDecimal discountAmount = BigDecimal.ZERO;

    // Helper method to update parent relationship
    public void setSalesRecord(SalesRecord salesRecord) {
        this.salesRecord = salesRecord;
        // Don't modify parent list directly here to avoid infinite loops if handled
        // poorly,
        // relying on service to manage bi-directional consistency or just setting it.
    }
}
