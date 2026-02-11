package com.grocersmart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeletedItemDto {
    private Long deletedId;
    private Long originalId;
    private LocalDateTime deletedAt;
    private Long deletedByUserId;
    private String reason;
    private String snapshotJson;
    private Boolean restored;
    private LocalDateTime restoredAt;
    private Integer restoreCount;
    private String entityName; // For display purposes (e.g., user's name, product name)
}
