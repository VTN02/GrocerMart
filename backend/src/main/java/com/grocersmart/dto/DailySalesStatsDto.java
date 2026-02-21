package com.grocersmart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailySalesStatsDto {
    private LocalDate date;
    private BigDecimal totalRevenue;
    private Long totalItemsSold; // Using Long for sum result from DB

    // Additional constructor for JPA if needed (though new ...() in JPQL usually
    // invokes matching constructor)
    // The previous one matches (LocalDate, BigDecimal, Long)
    // However, SUM(int) -> Long in JPA usually.
}
