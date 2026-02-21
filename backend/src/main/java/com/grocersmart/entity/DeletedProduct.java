package com.grocersmart.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "deleted_products")
@Data
@NoArgsConstructor
public class DeletedProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deletedId;

    @Column(nullable = false)
    private Long originalId;

    @Column(name = "public_id", length = 20)
    private String publicId;

    @Column(nullable = false)
    private LocalDateTime deletedAt = LocalDateTime.now();

    private Long deletedByUserId;

    @Column(length = 255)
    private String reason;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String snapshotJson;

    @Column(nullable = false)
    private Boolean restored = false;

    private LocalDateTime restoredAt;

    @Column(nullable = false)
    private Integer restoreCount = 0;

    @PrePersist
    protected void onCreate() {
        if (deletedAt == null) {
            deletedAt = LocalDateTime.now();
        }
        if (restored == null) {
            restored = false;
        }
        if (restoreCount == null) {
            restoreCount = 0;
        }
    }
}
