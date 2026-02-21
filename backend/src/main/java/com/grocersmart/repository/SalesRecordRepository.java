package com.grocersmart.repository;

import com.grocersmart.dto.DailySalesStatsDto;
import com.grocersmart.entity.SalesRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SalesRecordRepository extends JpaRepository<SalesRecord, Long>, JpaSpecificationExecutor<SalesRecord> {

        List<SalesRecord> findBySalesDateBetween(LocalDate startDate, LocalDate endDate);

        List<SalesRecord> findBySalesDate(LocalDate date);

        boolean existsByInvoiceId(String invoiceId);

        List<SalesRecord> findByCreditCustomerId(Long customerId);

        // Sum of integer produces Long in JPQL usually
        @Query("SELECT new com.grocersmart.dto.DailySalesStatsDto(s.salesDate, SUM(s.totalRevenue), SUM(CAST(s.totalItemsSold AS long))) "
                        +
                        "FROM SalesRecord s " +
                        "WHERE s.salesDate BETWEEN :startDate AND :endDate " +
                        "GROUP BY s.salesDate " +
                        "ORDER BY s.salesDate ASC")
        List<DailySalesStatsDto> getDailySalesStats(@Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        // Use native query sequence logic
        @Query(value = "SELECT next_val FROM invoice_sequences WHERE sequence_name = 'sales_invoice' FOR UPDATE", nativeQuery = true)
        Long getNextInvoiceSequence();

        @Modifying
        @Query(value = "UPDATE invoice_sequences SET next_val = next_val + 1 WHERE sequence_name = 'sales_invoice'", nativeQuery = true)
        void incrementInvoiceSequence();

        java.util.Optional<SalesRecord> findByPublicId(String publicId);

        long countByCreditCustomerIdAndPaymentStatusIn(Long customerId, List<SalesRecord.PaymentStatus> statuses);

        List<SalesRecord> findByCreditCustomerIdAndPaymentStatus(Long customerId, SalesRecord.PaymentStatus status);
}
