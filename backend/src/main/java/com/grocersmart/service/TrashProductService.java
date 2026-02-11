package com.grocersmart.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grocersmart.dto.DeleteResponse;
import com.grocersmart.dto.DeletedItemDto;
import com.grocersmart.dto.RestoreResponse;
import com.grocersmart.entity.DeletedProduct;
import com.grocersmart.entity.Product;
import com.grocersmart.repository.DeletedProductRepository;
import com.grocersmart.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrashProductService {

    private final ProductRepository productRepository;
    private final DeletedProductRepository deletedProductRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public DeleteResponse archiveAndDelete(Long id, String reason, Long deletedByUserId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));

        DeletedProduct deletedProduct = new DeletedProduct();
        deletedProduct.setOriginalId(product.getId());
        deletedProduct.setDeletedAt(LocalDateTime.now());
        deletedProduct.setDeletedByUserId(deletedByUserId);
        deletedProduct.setReason(reason);

        try {
            String snapshot = objectMapper.writeValueAsString(product);
            deletedProduct.setSnapshotJson(snapshot);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create snapshot: " + e.getMessage());
        }

        DeletedProduct saved = deletedProductRepository.save(deletedProduct);
        productRepository.delete(product);

        return new DeleteResponse(
                "Product archived successfully",
                saved.getDeletedId(),
                saved.getOriginalId(),
                saved.getDeletedAt());
    }

    @Transactional
    public RestoreResponse restore(Long deletedId) {
        DeletedProduct deletedProduct = deletedProductRepository.findById(deletedId)
                .orElseThrow(() -> new EntityNotFoundException("Deleted product not found with id: " + deletedId));

        if (deletedProduct.getRestored()) {
            throw new IllegalStateException("This product has already been restored");
        }

        Product product;
        try {
            product = objectMapper.readValue(deletedProduct.getSnapshotJson(), Product.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to restore from snapshot: " + e.getMessage());
        }

        if (productRepository.existsById(deletedProduct.getOriginalId())) {
            // Handle conflict: maybe append suffix or throw error?
            // For now throw error as per user logic
            throw new IllegalStateException(
                    "Cannot restore: Product with ID " + deletedProduct.getOriginalId() + " already exists. " +
                            "Please permanently delete the existing product first.");
        }

        Product restored = productRepository.save(product);

        deletedProduct.setRestored(true);
        deletedProduct.setRestoredAt(LocalDateTime.now());
        deletedProduct.setRestoreCount(deletedProduct.getRestoreCount() + 1);
        deletedProductRepository.save(deletedProduct);

        return new RestoreResponse(
                "Product restored successfully",
                restored.getId(),
                deletedProduct.getDeletedId(),
                deletedProduct.getRestoreCount());
    }

    public List<DeletedItemDto> getAllDeleted() {
        return deletedProductRepository.findByRestoredOrderByDeletedAtDesc(false)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DeletedItemDto getDeletedById(Long deletedId) {
        DeletedProduct deletedProduct = deletedProductRepository.findById(deletedId)
                .orElseThrow(() -> new EntityNotFoundException("Deleted product not found"));
        return mapToDto(deletedProduct);
    }

    @Transactional
    public void permanentDelete(Long deletedId) {
        DeletedProduct deletedProduct = deletedProductRepository.findById(deletedId)
                .orElseThrow(() -> new EntityNotFoundException("Deleted product not found"));
        deletedProductRepository.delete(deletedProduct);
    }

    private DeletedItemDto mapToDto(DeletedProduct deleted) {
        DeletedItemDto dto = new DeletedItemDto();
        dto.setDeletedId(deleted.getDeletedId());
        dto.setOriginalId(deleted.getOriginalId());
        dto.setDeletedAt(deleted.getDeletedAt());
        dto.setDeletedByUserId(deleted.getDeletedByUserId());
        dto.setReason(deleted.getReason());
        dto.setSnapshotJson(deleted.getSnapshotJson());
        dto.setRestored(deleted.getRestored());
        dto.setRestoredAt(deleted.getRestoredAt());
        dto.setRestoreCount(deleted.getRestoreCount());

        try {
            Product product = objectMapper.readValue(deleted.getSnapshotJson(), Product.class);
            dto.setEntityName(product.getName());
        } catch (Exception e) {
            dto.setEntityName("Unknown Product");
        }

        return dto;
    }
}
