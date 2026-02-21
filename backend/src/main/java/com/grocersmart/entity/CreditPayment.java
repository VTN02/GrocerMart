package com.grocersmart.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_payments")
@Data
@NoArgsConstructor
public class CreditPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private Double amount;

    private LocalDateTime paymentDate = LocalDateTime.now();
    private String note;

    @Column(name = "public_id", length = 20)
    private String publicId;

    @Column(name = "invoice_id")
    private Long invoiceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", columnDefinition = "VARCHAR(20) DEFAULT 'CASH'")
    private PaymentMethod method = PaymentMethod.CASH;

    @Enumerated(EnumType.STRING)
    private Status status = Status.SUCCESS;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
    private LocalDateTime deletedAt;
    private String deletedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum PaymentMethod {
        CASH, CHEQUE, BANK
    }

    public enum Status {
        SUCCESS, PENDING, BOUNCED
    }
}
