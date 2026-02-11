package com.grocersmart.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grocersmart.dto.DeleteResponse;
import com.grocersmart.dto.DeletedItemDto;
import com.grocersmart.dto.RestoreResponse;
import com.grocersmart.entity.DeletedCreditCustomer;
import com.grocersmart.entity.CreditCustomer;
import com.grocersmart.repository.DeletedCreditCustomerRepository;
import com.grocersmart.repository.CreditCustomerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrashCreditCustomerService {

    private final CreditCustomerRepository creditCustomerRepository;
    private final DeletedCreditCustomerRepository deletedCreditCustomerRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public DeleteResponse archiveAndDelete(Long id, String reason, Long deletedByUserId) {
        CreditCustomer creditCustomer = creditCustomerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("CreditCustomer not found with id: " + id));

        DeletedCreditCustomer deletedCreditCustomer = new DeletedCreditCustomer();
        deletedCreditCustomer.setOriginalId(creditCustomer.getId());
        deletedCreditCustomer.setDeletedAt(LocalDateTime.now());
        deletedCreditCustomer.setDeletedByUserId(deletedByUserId);
        deletedCreditCustomer.setReason(reason);

        try {
            String snapshot = objectMapper.writeValueAsString(creditCustomer);
            deletedCreditCustomer.setSnapshotJson(snapshot);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create snapshot: " + e.getMessage());
        }

        DeletedCreditCustomer saved = deletedCreditCustomerRepository.save(deletedCreditCustomer);
        creditCustomerRepository.delete(creditCustomer);

        return new DeleteResponse(
                "CreditCustomer archived successfully",
                saved.getDeletedId(),
                saved.getOriginalId(),
                saved.getDeletedAt());
    }

    @Transactional
    public RestoreResponse restore(Long deletedId) {
        DeletedCreditCustomer deletedCreditCustomer = deletedCreditCustomerRepository.findById(deletedId)
                .orElseThrow(
                        () -> new EntityNotFoundException("Deleted credit customer not found with id: " + deletedId));

        if (deletedCreditCustomer.getRestored()) {
            throw new IllegalStateException("This credit customer has already been restored");
        }

        CreditCustomer creditCustomer;
        try {
            creditCustomer = objectMapper.readValue(deletedCreditCustomer.getSnapshotJson(), CreditCustomer.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to restore from snapshot: " + e.getMessage());
        }

        if (creditCustomerRepository.existsById(deletedCreditCustomer.getOriginalId())) {
            throw new IllegalStateException(
                    "Cannot restore: Credit customer with ID " + deletedCreditCustomer.getOriginalId()
                            + " already exists. " +
                            "Please permanently delete the existing credit customer first.");
        }

        CreditCustomer restored = creditCustomerRepository.save(creditCustomer);

        deletedCreditCustomer.setRestored(true);
        deletedCreditCustomer.setRestoredAt(LocalDateTime.now());
        deletedCreditCustomer.setRestoreCount(deletedCreditCustomer.getRestoreCount() + 1);
        deletedCreditCustomerRepository.save(deletedCreditCustomer);

        return new RestoreResponse(
                "CreditCustomer restored successfully",
                restored.getId(),
                deletedCreditCustomer.getDeletedId(),
                deletedCreditCustomer.getRestoreCount());
    }

    public List<DeletedItemDto> getAllDeleted() {
        return deletedCreditCustomerRepository.findByRestoredOrderByDeletedAtDesc(false)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DeletedItemDto getDeletedById(Long deletedId) {
        DeletedCreditCustomer deletedCreditCustomer = deletedCreditCustomerRepository.findById(deletedId)
                .orElseThrow(() -> new EntityNotFoundException("Deleted credit customer not found"));
        return mapToDto(deletedCreditCustomer);
    }

    @Transactional
    public void permanentDelete(Long deletedId) {
        DeletedCreditCustomer deletedCreditCustomer = deletedCreditCustomerRepository.findById(deletedId)
                .orElseThrow(() -> new EntityNotFoundException("Deleted credit customer not found"));
        deletedCreditCustomerRepository.delete(deletedCreditCustomer);
    }

    private DeletedItemDto mapToDto(DeletedCreditCustomer deleted) {
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
            CreditCustomer creditCustomer = objectMapper.readValue(deleted.getSnapshotJson(), CreditCustomer.class);
            dto.setEntityName(creditCustomer.getName());
        } catch (Exception e) {
            dto.setEntityName("Unknown CreditCustomer");
        }

        return dto;
    }
}
