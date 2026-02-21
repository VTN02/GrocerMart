package com.grocersmart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeletedItemDto {
    // Common / New fields
    private Long id; // Can be used as deletedId or originalId depending on context
    private String name;
    private String description;
    private String publicId;

    // Legacy / specific fields from TrashProductService etc.
    private Long deletedId;
    private Long originalId;
    private LocalDateTime deletedAt;
    private Long deletedByUserId;
    private String reason;

    private String snapshotJson;

    public String getName() {
        return name != null ? name : entityName;
    }

    private Boolean restored;
    private LocalDateTime restoredAt;
    private Integer restoreCount;
    private String entityName;
}
