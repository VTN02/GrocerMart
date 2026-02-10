package com.grocersmart.repository;

import com.grocersmart.entity.StockConversion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockConversionRepository extends JpaRepository<StockConversion, Long> {
}
