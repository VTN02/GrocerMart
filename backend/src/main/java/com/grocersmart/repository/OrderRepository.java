package com.grocersmart.repository;

import com.grocersmart.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    java.util.Optional<Order> findByPublicId(String publicId);
}
