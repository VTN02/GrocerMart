package com.grocersmart.repository;

import com.grocersmart.entity.CreditCustomer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CreditCustomerRepository extends JpaRepository<CreditCustomer, Long> {
}
