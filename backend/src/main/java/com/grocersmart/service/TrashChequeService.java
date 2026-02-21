package com.grocersmart.service;

import com.grocersmart.dto.DeletedItemDto;
import com.grocersmart.dto.RestoreResponse;
import com.grocersmart.entity.Cheque;
import com.grocersmart.repository.ChequeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrashChequeService {

    private final JdbcTemplate jdbcTemplate;
    private final ChequeRepository chequeRepository;
    private final ObjectMapper objectMapper;

    public List<DeletedItemDto> getAllDeleted() {
        String sql = "SELECT deleted_id, original_id, public_id, deleted_at, snapshot_json FROM deleted_cheques WHERE restored = FALSE ORDER BY deleted_at DESC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            DeletedItemDto dto = new DeletedItemDto();
            dto.setDeletedId(rs.getLong("deleted_id"));
            dto.setId(rs.getLong("deleted_id"));
            dto.setOriginalId(rs.getLong("original_id"));
            dto.setPublicId(rs.getString("public_id"));
            String name = rs.getString("public_id") != null ? rs.getString("public_id")
                    : "Cheque #" + rs.getLong("original_id");
            dto.setName(name);
            dto.setDeletedAt(rs.getTimestamp("deleted_at").toLocalDateTime());
            dto.setSnapshotJson(rs.getString("snapshot_json"));
            return dto;
        });
    }

    @Transactional
    public RestoreResponse restore(Long deletedId) {
        String sql = "SELECT snapshot_json FROM deleted_cheques WHERE deleted_id = ?";
        String jsonData = jdbcTemplate.queryForObject(sql, String.class, deletedId);

        try {
            Cheque cheque = objectMapper.readValue(jsonData, Cheque.class);
            cheque.setId(null); // Force new record (with same data)
            chequeRepository.save(cheque);

            jdbcTemplate.update("UPDATE deleted_cheques SET restored = TRUE, restored_at = ? WHERE deleted_id = ?",
                    LocalDateTime.now(), deletedId);

            return new RestoreResponse(true, "Cheque restored successfully");
        } catch (Exception e) {
            throw new RuntimeException("Failed to restore cheque", e);
        }
    }

    @Transactional
    public void permanentDelete(Long deletedId) {
        jdbcTemplate.update("DELETE FROM deleted_cheques WHERE deleted_id = ?", deletedId);
    }

    @Transactional
    public void moveToTrash(Cheque cheque) {
        try {
            String json = objectMapper.writeValueAsString(cheque);
            String sql = "INSERT INTO deleted_cheques (original_id, public_id, snapshot_json, deleted_at) VALUES (?, ?, ?, ?)";
            jdbcTemplate.update(sql, cheque.getId(), cheque.getPublicId(), json, LocalDateTime.now());

            chequeRepository.delete(cheque);
        } catch (Exception e) {
            throw new RuntimeException("Failed to move cheque to trash", e);
        }
    }
}
