package com.grocersmart.repository;

import com.grocersmart.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    List<Supplier> findByStatus(Supplier.Status status);
}
