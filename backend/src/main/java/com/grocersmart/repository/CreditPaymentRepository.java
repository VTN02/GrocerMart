package com.grocersmart.repository;

import com.grocersmart.entity.CreditPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CreditPaymentRepository extends JpaRepository<CreditPayment, Long> {
    List<CreditPayment> findByCustomerId(Long customerId);
}
