package com.grocersmart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeleteResponse {
    private String message;
    private Long deletedId;
    private Long originalId;
    private LocalDateTime deletedAt;
}
