package com.grocersmart.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public Map<String, Object> resetSystem() {
        Map<String, Object> response = new HashMap<>();

        // Disable foreign key checks to allow truncate
        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");

        try {
            // Main Tables
            jdbcTemplate.execute("TRUNCATE TABLE order_items");
            jdbcTemplate.execute("TRUNCATE TABLE orders");
            jdbcTemplate.execute("TRUNCATE TABLE sales_items");
            jdbcTemplate.execute("TRUNCATE TABLE sales_records");
            jdbcTemplate.execute("TRUNCATE TABLE cheques");
            jdbcTemplate.execute("TRUNCATE TABLE purchase_order_items");
            jdbcTemplate.execute("TRUNCATE TABLE purchase_orders");
            jdbcTemplate.execute("TRUNCATE TABLE stock_conversions");
            jdbcTemplate.execute("TRUNCATE TABLE credit_payments");
            jdbcTemplate.execute("TRUNCATE TABLE credit_customers");
            jdbcTemplate.execute("TRUNCATE TABLE products");
            jdbcTemplate.execute("TRUNCATE TABLE suppliers");

            // Trash Tables
            jdbcTemplate.execute("TRUNCATE TABLE deleted_orders");
            jdbcTemplate.execute("TRUNCATE TABLE deleted_sales");
            jdbcTemplate.execute("TRUNCATE TABLE deleted_cheques");
            jdbcTemplate.execute("TRUNCATE TABLE deleted_users");
            jdbcTemplate.execute("TRUNCATE TABLE deleted_products");
            jdbcTemplate.execute("TRUNCATE TABLE deleted_suppliers");
            jdbcTemplate.execute("TRUNCATE TABLE deleted_credit_customers");

            // User Management - Preserve VTNV
            jdbcTemplate.execute("DELETE FROM users WHERE username <> 'VTNV'");
            // Ensure VTNV is active and has correct default password if it was somehow
            // changed?
            // The user said "DO NOT reset VTNV password", so we just keep it.

            response.put("message", "System reset completed successfully");
            response.put("adminPreserved", true);
            response.put("trashCleared", true);

        } catch (Exception e) {
            throw new RuntimeException("System reset failed: " + e.getMessage(), e);
        } finally {
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
        }

        return response;
    }
}
