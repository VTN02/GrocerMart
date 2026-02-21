package com.grocersmart.service;

import com.grocersmart.common.EntityType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PublicIdGeneratorService {

    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public String nextId(EntityType type) {
        // 1. Lock the row for this entity type
        String sqlSelectForUpdate = "SELECT next_number FROM public_id_sequence WHERE entity_type = ? FOR UPDATE";
        Long nextVal;
        try {
            nextVal = jdbcTemplate.queryForObject(sqlSelectForUpdate, Long.class, type.name());
        } catch (Exception e) {
            // If row doesn't exist, insert it (should exist from migration but safe to
            // handle)
            jdbcTemplate.update("INSERT INTO public_id_sequence (entity_type, next_number) VALUES (?, ?)", type.name(),
                    1L);
            nextVal = 1L;
        }

        if (nextVal == null) {
            nextVal = 1L;
        }

        // 2. Increment
        String sqlUpdate = "UPDATE public_id_sequence SET next_number = ? WHERE entity_type = ?";
        jdbcTemplate.update(sqlUpdate, nextVal + 1, type.name());

        // 3. Format
        return String.format("%s-%04d", type.getPrefix(), nextVal);
    }
}
