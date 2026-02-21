package com.grocersmart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestoreResponse {
    private boolean success;
    private String message;

    // Additional fields for compatibility
    private Long restoredId;
    private Long deletedId;
    private Integer restoreCount;

    // Constructor for simple success/message
    public RestoreResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    // Constructor matching typical usage in TrashProductService
    public RestoreResponse(String message, Long restoredId, Long deletedId, Integer restoreCount) {
        this.success = true; // Assuming successful if this constructor is used
        this.message = message;
        this.restoredId = restoredId;
        this.deletedId = deletedId;
        this.restoreCount = restoreCount;
    }
}
