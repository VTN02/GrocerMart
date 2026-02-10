package com.grocersmart.dto;

import com.grocersmart.entity.Cheque;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ChequeDto {
    private Long id;
    private String chequeNumber;
    private Long customerId;
    private String bankName;
    private Double amount;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private Cheque.Status status;
    private String note;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}
