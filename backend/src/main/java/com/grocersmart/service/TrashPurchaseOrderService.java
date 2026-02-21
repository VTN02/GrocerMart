package com.grocersmart.service;

import com.grocersmart.dto.DeletedItemDto;
import com.grocersmart.dto.RestoreResponse;
import com.grocersmart.entity.PurchaseOrder;
import com.grocersmart.repository.PurchaseOrderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrashPurchaseOrderService {

    private final JdbcTemplate jdbcTemplate;
    private final PurchaseOrderRepository poRepository;
    private final ObjectMapper objectMapper;

    public List<DeletedItemDto> getAllDeleted() {
        String sql = "SELECT deleted_id, original_id, public_id, deleted_at, snapshot_json FROM deleted_purchase_orders WHERE restored = FALSE ORDER BY deleted_at DESC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            DeletedItemDto dto = new DeletedItemDto();
            dto.setDeletedId(rs.getLong("deleted_id"));
            dto.setId(rs.getLong("deleted_id"));
            dto.setOriginalId(rs.getLong("original_id"));
            dto.setPublicId(rs.getString("public_id"));
            String name = rs.getString("public_id") != null ? rs.getString("public_id")
                    : "PO #" + rs.getLong("original_id");
            dto.setName(name);
            dto.setDeletedAt(rs.getTimestamp("deleted_at").toLocalDateTime());
            dto.setSnapshotJson(rs.getString("snapshot_json"));
            return dto;
        });
    }

    @Transactional
    public RestoreResponse restore(Long deletedId) {
        String sql = "SELECT snapshot_json FROM deleted_purchase_orders WHERE deleted_id = ?";
        String jsonData = jdbcTemplate.queryForObject(sql, String.class, deletedId);

        try {
            PurchaseOrder po = objectMapper.readValue(jsonData, PurchaseOrder.class);

            PurchaseOrder toRestore = new PurchaseOrder();
            toRestore.setPublicId(po.getPublicId());
            toRestore.setSupplierId(po.getSupplierId());
            toRestore.setPoDate(po.getPoDate());
            toRestore.setStatus(po.getStatus());
            toRestore.setTotalAmount(po.getTotalAmount());
            // Items are not automatically restored here unless handled manually or via
            // cascade if mapped
            // Typically snapshot JSON contains full object graph if configured correctly.
            // If items are separate entities, they might need manual reconstruction if JSON
            // deserialization doesn't handle back-references or IDs.
            // For now, let's assume simple restoration of main fields. Items might be lost
            // or need complex restoration logic similar to OrderService.

            poRepository.save(toRestore);

            jdbcTemplate.update(
                    "UPDATE deleted_purchase_orders SET restored = TRUE, restored_at = ? WHERE deleted_id = ?",
                    LocalDateTime.now(), deletedId);

            return new RestoreResponse(true, "Purchase Order restored successfully");
        } catch (Exception e) {
            throw new RuntimeException("Failed to restore purchase order", e);
        }
    }

    @Transactional
    public void permanentDelete(Long deletedId) {
        jdbcTemplate.update("DELETE FROM deleted_purchase_orders WHERE deleted_id = ?", deletedId);
    }

    @Transactional
    public void moveToTrash(PurchaseOrder po) {
        try {
            String json = objectMapper.writeValueAsString(po);
            String sql = "INSERT INTO deleted_purchase_orders (original_id, public_id, snapshot_json, deleted_at) VALUES (?, ?, ?, ?)";
            jdbcTemplate.update(sql, po.getId(), po.getPublicId(), json, LocalDateTime.now());

            poRepository.delete(po);
        } catch (Exception e) {
            throw new RuntimeException("Failed to move purchase order to trash", e);
        }
    }
}
