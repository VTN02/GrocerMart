package com.grocersmart.repository;

import com.grocersmart.entity.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    java.util.Optional<PurchaseOrder> findByPublicId(String publicId);
}
