package com.grocersmart.repository;

import com.grocersmart.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SupplierRepository extends JpaRepository<Supplier, Long>, JpaSpecificationExecutor<Supplier> {
    List<Supplier> findByStatus(Supplier.Status status);

    java.util.Optional<Supplier> findByPublicId(String publicId);
}
