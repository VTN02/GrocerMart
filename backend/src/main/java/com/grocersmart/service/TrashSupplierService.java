package com.grocersmart.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grocersmart.dto.DeleteResponse;
import com.grocersmart.dto.DeletedItemDto;
import com.grocersmart.dto.RestoreResponse;
import com.grocersmart.entity.DeletedSupplier;
import com.grocersmart.entity.Supplier;
import com.grocersmart.repository.DeletedSupplierRepository;
import com.grocersmart.repository.SupplierRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrashSupplierService {

    private final SupplierRepository supplierRepository;
    private final DeletedSupplierRepository deletedSupplierRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public DeleteResponse archiveAndDelete(Long id, String reason, Long deletedByUserId) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + id));

        DeletedSupplier deletedSupplier = new DeletedSupplier();
        deletedSupplier.setOriginalId(supplier.getId());
        deletedSupplier.setDeletedAt(LocalDateTime.now());
        deletedSupplier.setDeletedByUserId(deletedByUserId);
        deletedSupplier.setReason(reason);
        deletedSupplier.setPublicId(supplier.getPublicId());

        try {
            String snapshot = objectMapper.writeValueAsString(supplier);
            deletedSupplier.setSnapshotJson(snapshot);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create snapshot: " + e.getMessage());
        }

        DeletedSupplier saved = deletedSupplierRepository.save(deletedSupplier);
        supplierRepository.delete(supplier);

        return new DeleteResponse(
                "Supplier archived successfully",
                saved.getDeletedId(),
                saved.getOriginalId(),
                saved.getDeletedAt());
    }

    @Transactional
    public RestoreResponse restore(Long deletedId) {
        DeletedSupplier deletedSupplier = deletedSupplierRepository.findById(deletedId)
                .orElseThrow(() -> new EntityNotFoundException("Deleted supplier not found with id: " + deletedId));

        if (deletedSupplier.getRestored()) {
            throw new IllegalStateException("This supplier has already been restored");
        }

        Supplier supplier;
        try {
            supplier = objectMapper.readValue(deletedSupplier.getSnapshotJson(), Supplier.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to restore from snapshot: " + e.getMessage());
        }

        if (supplierRepository.existsById(deletedSupplier.getOriginalId())) {
            throw new IllegalStateException(
                    "Cannot restore: Supplier with ID " + deletedSupplier.getOriginalId() + " already exists. " +
                            "Please permanently delete the existing supplier first.");
        }

        Supplier restored = supplierRepository.save(supplier);

        deletedSupplier.setRestored(true);
        deletedSupplier.setRestoredAt(LocalDateTime.now());
        deletedSupplier.setRestoreCount(deletedSupplier.getRestoreCount() + 1);
        deletedSupplierRepository.save(deletedSupplier);

        return new RestoreResponse(
                "Supplier restored successfully",
                restored.getId(),
                deletedSupplier.getDeletedId(),
                deletedSupplier.getRestoreCount());
    }

    public List<DeletedItemDto> getAllDeleted() {
        return deletedSupplierRepository.findByRestoredOrderByDeletedAtDesc(false)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DeletedItemDto getDeletedById(Long deletedId) {
        DeletedSupplier deletedSupplier = deletedSupplierRepository.findById(deletedId)
                .orElseThrow(() -> new EntityNotFoundException("Deleted supplier not found"));
        return mapToDto(deletedSupplier);
    }

    @Transactional
    public void permanentDelete(Long deletedId) {
        DeletedSupplier deletedSupplier = deletedSupplierRepository.findById(deletedId)
                .orElseThrow(() -> new EntityNotFoundException("Deleted supplier not found"));
        deletedSupplierRepository.delete(deletedSupplier);
    }

    private DeletedItemDto mapToDto(DeletedSupplier deleted) {
        DeletedItemDto dto = new DeletedItemDto();
        dto.setDeletedId(deleted.getDeletedId());
        dto.setId(deleted.getDeletedId());
        dto.setOriginalId(deleted.getOriginalId());
        dto.setDeletedAt(deleted.getDeletedAt());
        dto.setDeletedByUserId(deleted.getDeletedByUserId());
        dto.setReason(deleted.getReason());
        dto.setSnapshotJson(deleted.getSnapshotJson());
        dto.setRestored(deleted.getRestored());
        dto.setRestoredAt(deleted.getRestoredAt());
        dto.setRestoreCount(deleted.getRestoreCount());
        dto.setPublicId(deleted.getPublicId());

        try {
            Supplier supplier = objectMapper.readValue(deleted.getSnapshotJson(), Supplier.class);
            dto.setEntityName(supplier.getName());
        } catch (Exception e) {
            dto.setEntityName("Unknown Supplier");
        }

        return dto;
    }
}
