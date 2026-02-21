package com.grocersmart.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales_records")
@Data
@NoArgsConstructor
public class SalesRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", unique = true, nullable = false, length = 20)
    private String publicId;

    @Column(nullable = false, unique = true)
    private String invoiceId;

    @Column(nullable = false)
    private LocalDate salesDate;

    // Optional store ID if multi-store support is added later
    private Long storeId;

    @Column(nullable = false)
    private BigDecimal totalRevenue = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer totalItemsSold = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'CASH'")
    private PaymentMethod paymentMethod = PaymentMethod.CASH;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(20) DEFAULT 'UNPAID'")
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    private LocalDate dueDate;
    private BigDecimal paidAmount = BigDecimal.ZERO;
    private Integer daysOverdue = 0;
    private Long cashierId;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    private LocalDateTime deletedAt;
    private String deletedBy;

    // Optional Credit Customer Link
    @ManyToOne
    @JoinColumn(name = "credit_customer_id")
    private CreditCustomer creditCustomer;

    @Column(columnDefinition = "TEXT")
    private String note;

    @OneToMany(mappedBy = "salesRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalesItem> items = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum PaymentMethod {
        CASH, CREDIT
    }

    public enum PaymentStatus {
        PAID, PARTIAL, UNPAID
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
