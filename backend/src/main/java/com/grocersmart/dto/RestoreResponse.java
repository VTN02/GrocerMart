package com.grocersmart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestoreResponse {
    private String message;
    private Long restoredId;
    private Long deletedId;
    private Integer restoreCount;
}
