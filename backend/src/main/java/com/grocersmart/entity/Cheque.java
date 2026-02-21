package com.grocersmart.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cheques")
@Data
@NoArgsConstructor
public class Cheque {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", unique = true, nullable = false, length = 20)
    private String publicId;

    private String chequeNumber;
    private Long customerId;
    private String bankName;

    @Column(nullable = false)
    private Double amount;

    private LocalDate issueDate;
    private LocalDate dueDate;

    @Column(name = "invoice_id")
    private Long invoiceId;

    private LocalDate depositDate;
    private LocalDate clearedDate;
    private LocalDate bouncedDate;

    @Column(name = "bounce_reason")
    private String bounceReason;

    @Column(name = "migrated_to_debt")
    private Boolean migratedToDebt = false;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
    private LocalDateTime deletedAt;
    private String deletedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(50)")
    private Status status = Status.PENDING;

    private String note;

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

    public enum Status {
        PENDING, DEPOSITED, CLEARED, BOUNCED
    }
}
