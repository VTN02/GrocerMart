package com.grocersmart.repository;

import com.grocersmart.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByCategory(String category, Pageable pageable);

    java.util.Optional<Product> findByNameIgnoreCase(String name);

    Optional<Product> findById(Long id);

    Page<Product> findByStatus(Product.Status status, Pageable pageable);

    Page<Product> findByCategoryAndStatus(String category, Product.Status status, Pageable pageable);

    java.util.List<Product> findByStatus(Product.Status status);
}
