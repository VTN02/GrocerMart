package com.grocersmart.service;

import com.grocersmart.dto.DeletedItemDto;
import com.grocersmart.dto.RestoreResponse;
import com.grocersmart.entity.Order;
import com.grocersmart.repository.OrderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrashOrderService {

    private final JdbcTemplate jdbcTemplate;
    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;

    public List<DeletedItemDto> getAllDeleted() {
        String sql = "SELECT deleted_id, original_id, public_id, deleted_at, snapshot_json FROM deleted_orders WHERE restored = FALSE ORDER BY deleted_at DESC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            DeletedItemDto dto = new DeletedItemDto();
            dto.setDeletedId(rs.getLong("deleted_id"));
            dto.setId(rs.getLong("deleted_id"));
            dto.setOriginalId(rs.getLong("original_id"));
            dto.setPublicId(rs.getString("public_id"));
            String name = rs.getString("public_id") != null ? rs.getString("public_id")
                    : "Order #" + rs.getLong("original_id");
            dto.setName(name);
            dto.setDeletedAt(rs.getTimestamp("deleted_at").toLocalDateTime());
            dto.setSnapshotJson(rs.getString("snapshot_json"));
            return dto;
        });
    }

    @Transactional
    public RestoreResponse restore(Long deletedId) {
        String sql = "SELECT snapshot_json FROM deleted_orders WHERE deleted_id = ?";
        String jsonData = jdbcTemplate.queryForObject(sql, String.class, deletedId);

        try {
            Order order = objectMapper.readValue(jsonData, Order.class);
            // Ensure ID is null so it creates a new record or we can try to force original
            // ID
            // Since we want accuracy, let's try to restore as a new record but mirroring
            // data.
            // Items are usually cascaded.

            Order toRestore = new Order();
            // Restore public ID if logic allows, or generate new? For now keep original
            // logic intent but mapped
            toRestore.setPublicId(order.getPublicId());
            toRestore.setInvoiceNo(order.getInvoiceNo());
            toRestore.setOrderDate(order.getOrderDate());
            toRestore.setPaymentType(order.getPaymentType());
            toRestore.setStatus(order.getStatus());
            toRestore.setTotalAmount(order.getTotalAmount());
            // If there are items in the snapshot, they should be handled by the mapper or
            // manually

            orderRepository.save(toRestore);

            jdbcTemplate.update("UPDATE deleted_orders SET restored = TRUE, restored_at = ? WHERE deleted_id = ?",
                    LocalDateTime.now(), deletedId);

            return new RestoreResponse(true, "Order restored successfully");
        } catch (Exception e) {
            throw new RuntimeException("Failed to restore order", e);
        }
    }

    @Transactional
    public void permanentDelete(Long deletedId) {
        jdbcTemplate.update("DELETE FROM deleted_orders WHERE deleted_id = ?", deletedId);
    }

    @Transactional
    public void moveToTrash(Order order) {
        try {
            // Serialize full object including items
            String json = objectMapper.writeValueAsString(order);
            String sql = "INSERT INTO deleted_orders (original_id, public_id, snapshot_json, deleted_at) VALUES (?, ?, ?, ?)";
            jdbcTemplate.update(sql, order.getId(), order.getPublicId(), json, LocalDateTime.now());

            orderRepository.delete(order);
        } catch (Exception e) {
            throw new RuntimeException("Failed to move order to trash", e);
        }
    }
}
