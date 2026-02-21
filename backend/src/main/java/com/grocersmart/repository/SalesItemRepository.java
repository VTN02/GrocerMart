package com.grocersmart.repository;

import com.grocersmart.dto.TopProductStatsDto;
import com.grocersmart.entity.SalesItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SalesItemRepository extends JpaRepository<SalesItem, Long> {

        // Top Products Analytics
        @Query("SELECT new com.grocersmart.dto.TopProductStatsDto(si.product.id, si.product.name, SUM(si.qtySold), SUM(si.lineTotal)) "
                        +
                        "FROM SalesItem si " +
                        "WHERE si.salesRecord.salesDate BETWEEN :startDate AND :endDate " +
                        "GROUP BY si.product.id, si.product.name " +
                        "ORDER BY SUM(si.lineTotal) DESC")
        List<TopProductStatsDto> getTopSellingProducts(@Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        Pageable pageable);
}
