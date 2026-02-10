package com.grocersmart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CsvImportResultDTO {
    private LocalDateTime timestamp;
    private boolean success;
    private String message;

    private int totalRows;
    private int imported;
    private int skippedDuplicates;
    private int failedRows;
    private List<String> errors;
}
