package com.grocersmart.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_customers")
@Data
@NoArgsConstructor
public class CreditCustomer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", unique = true, nullable = false, length = 20)
    private String publicId;

    @Column(nullable = false)
    private String name;

    private String phone;
    private String address;

    private Double creditLimit;
    private Double outstandingBalance = 0.0;

    @Column(name = "available_credit")
    private Double availableCredit = 0.0;

    @Column(name = "payment_terms_days", nullable = false)
    private Integer paymentTermsDays = 30;

    @Column(name = "authorized_threshold")
    private Double authorizedThreshold;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_type")
    private CustomerType customerType = CustomerType.CREDIT;

    @Column(name = "total_purchases")
    private Double totalPurchases = 0.0;

    @Column(name = "total_paid")
    private Double totalPaid = 0.0;

    @Column(name = "last_payment_date")
    private java.time.LocalDate lastPaymentDate;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
    private LocalDateTime deletedAt;
    private String deletedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void updateBalance(Double newOutstanding) {
        this.outstandingBalance = (newOutstanding != null ? newOutstanding : 0.0);
        double limit = (this.creditLimit != null ? this.creditLimit : 0.0);
        this.availableCredit = Math.max(0.0, limit - this.outstandingBalance);
    }

    public enum Status {
        ACTIVE, INACTIVE
    }

    public enum CustomerType {
        CASH, CREDIT
    }
}
