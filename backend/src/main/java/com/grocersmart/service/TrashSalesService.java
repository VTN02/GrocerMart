package com.grocersmart.service;

import com.grocersmart.dto.DeletedItemDto;
import com.grocersmart.dto.RestoreResponse;
import com.grocersmart.entity.SalesRecord;
import com.grocersmart.repository.SalesRecordRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrashSalesService {

    private final JdbcTemplate jdbcTemplate;
    private final SalesRecordRepository salesRecordRepository;
    private final ObjectMapper objectMapper;

    public List<DeletedItemDto> getAllDeleted() {
        String sql = "SELECT deleted_id, original_id, public_id, deleted_at, snapshot_json FROM deleted_sales WHERE restored = FALSE ORDER BY deleted_at DESC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            DeletedItemDto dto = new DeletedItemDto();
            dto.setDeletedId(rs.getLong("deleted_id"));
            dto.setId(rs.getLong("deleted_id"));
            dto.setId(rs.getLong("deleted_id"));
            dto.setOriginalId(rs.getLong("original_id"));
            dto.setPublicId(rs.getString("public_id"));
            String name = rs.getString("public_id") != null ? rs.getString("public_id")
                    : "Sale #" + rs.getLong("original_id");
            dto.setName(name);
            dto.setDeletedAt(rs.getTimestamp("deleted_at").toLocalDateTime());
            dto.setSnapshotJson(rs.getString("snapshot_json"));
            return dto;
        });
    }

    @Transactional
    public RestoreResponse restore(Long deletedId) {
        String sql = "SELECT snapshot_json FROM deleted_sales WHERE deleted_id = ?";
        String jsonData = jdbcTemplate.queryForObject(sql, String.class, deletedId);

        try {
            SalesRecord record = objectMapper.readValue(jsonData, SalesRecord.class);

            // Re-link items to the record (deserialization might not do it
            // bi-directionally)
            if (record.getItems() != null) {
                record.getItems().forEach(item -> {
                    item.setId(null); // Ensure items are new
                    item.setSalesRecord(record);
                });
            }
            record.setId(null); // Ensure record is new

            salesRecordRepository.save(record);

            jdbcTemplate.update("UPDATE deleted_sales SET restored = TRUE, restored_at = ? WHERE deleted_id = ?",
                    LocalDateTime.now(), deletedId);

            return new RestoreResponse(true, "Sales record restored successfully");
        } catch (Exception e) {
            throw new RuntimeException("Failed to restore sales record", e);
        }
    }

    @Transactional
    public void permanentDelete(Long deletedId) {
        jdbcTemplate.update("DELETE FROM deleted_sales WHERE deleted_id = ?", deletedId);
    }

    @Transactional
    public void moveToTrash(SalesRecord record) {
        try {
            String json = objectMapper.writeValueAsString(record);
            String sql = "INSERT INTO deleted_sales (original_id, public_id, snapshot_json, deleted_at) VALUES (?, ?, ?, ?)";
            jdbcTemplate.update(sql, record.getId(), record.getPublicId(), json, LocalDateTime.now());

            salesRecordRepository.delete(record);
        } catch (Exception e) {
            throw new RuntimeException("Failed to move sale to trash", e);
        }
    }
}
