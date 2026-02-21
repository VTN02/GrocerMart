package com.grocersmart.repository;

import com.grocersmart.entity.Cheque;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ChequeRepository extends JpaRepository<Cheque, Long>, JpaSpecificationExecutor<Cheque> {
    java.util.Optional<Cheque> findByPublicId(String publicId);
}
