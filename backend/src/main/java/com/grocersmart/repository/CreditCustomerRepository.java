package com.grocersmart.repository;

import com.grocersmart.entity.CreditCustomer;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CreditCustomerRepository
        extends JpaRepository<CreditCustomer, Long>, JpaSpecificationExecutor<CreditCustomer> {
    java.util.List<CreditCustomer> findByStatus(CreditCustomer.Status status);

    java.util.Optional<CreditCustomer> findByPublicId(String publicId);
}
