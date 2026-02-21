package com.grocersmart.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grocersmart.dto.DeleteResponse;
import com.grocersmart.dto.DeletedItemDto;
import com.grocersmart.dto.RestoreResponse;
import com.grocersmart.dto.UserDto;
import com.grocersmart.entity.DeletedUser;
import com.grocersmart.entity.User;
import com.grocersmart.repository.DeletedUserRepository;
import com.grocersmart.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrashUserService {

    private final UserRepository userRepository;
    private final DeletedUserRepository deletedUserRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public DeleteResponse archiveAndDelete(Long id, String reason, Long deletedByUserId) {
        // Fetch existing record
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        // Create snapshot
        DeletedUser deletedUser = new DeletedUser();
        deletedUser.setOriginalId(user.getId());
        deletedUser.setDeletedAt(LocalDateTime.now());
        deletedUser.setDeletedByUserId(deletedByUserId);
        deletedUser.setReason(reason);
        deletedUser.setPublicId(user.getPublicId());

        try {
            // Serialize user to JSON
            String snapshot = objectMapper.writeValueAsString(user);
            deletedUser.setSnapshotJson(snapshot);
        } catch (Exception e) {
            throw new RuntimeException("Failed to create snapshot: " + e.getMessage());
        }

        // Save to deleted table
        DeletedUser saved = deletedUserRepository.save(deletedUser);

        // Hard delete from main table
        userRepository.delete(user);

        return new DeleteResponse(
                "User archived successfully",
                saved.getDeletedId(),
                saved.getOriginalId(),
                saved.getDeletedAt());
    }

    @Transactional
    public RestoreResponse restore(Long deletedId) {
        // Load deleted record
        DeletedUser deletedUser = deletedUserRepository.findById(deletedId)
                .orElseThrow(() -> new EntityNotFoundException("Deleted user not found with id: " + deletedId));

        if (deletedUser.getRestored()) {
            throw new IllegalStateException("This user has already been restored");
        }

        User user;
        try {
            // Deserialize from JSON
            user = objectMapper.readValue(deletedUser.getSnapshotJson(), User.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to restore from snapshot: " + e.getMessage());
        }

        // Check if originalId already exists
        if (userRepository.existsById(deletedUser.getOriginalId())) {
            throw new IllegalStateException(
                    "Cannot restore: User with ID " + deletedUser.getOriginalId() + " already exists. " +
                            "Please permanently delete the existing user first or contact administrator.");
        }

        // Restore to main table with original ID
        User restored = userRepository.save(user);

        // Mark as restored
        deletedUser.setRestored(true);
        deletedUser.setRestoredAt(LocalDateTime.now());
        deletedUser.setRestoreCount(deletedUser.getRestoreCount() + 1);
        deletedUserRepository.save(deletedUser);

        return new RestoreResponse(
                "User restored successfully",
                restored.getId(),
                deletedUser.getDeletedId(),
                deletedUser.getRestoreCount());
    }

    public List<DeletedItemDto> getAllDeleted() {
        return deletedUserRepository.findByRestoredOrderByDeletedAtDesc(false)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<DeletedItemDto> getAllDeletedIncludingRestored() {
        return deletedUserRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DeletedItemDto getDeletedById(Long deletedId) {
        DeletedUser deletedUser = deletedUserRepository.findById(deletedId)
                .orElseThrow(() -> new EntityNotFoundException("Deleted user not found"));
        return mapToDto(deletedUser);
    }

    @Transactional
    public void permanentDelete(Long deletedId) {
        DeletedUser deletedUser = deletedUserRepository.findById(deletedId)
                .orElseThrow(() -> new EntityNotFoundException("Deleted user not found"));
        deletedUserRepository.delete(deletedUser);
    }

    private DeletedItemDto mapToDto(DeletedUser deleted) {
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
        dto.setRestoredAt(deleted.getRestoredAt());
        dto.setRestoreCount(deleted.getRestoreCount());
        dto.setPublicId(deleted.getPublicId());

        // Extract entity name from snapshot for display
        try {
            User user = objectMapper.readValue(deleted.getSnapshotJson(), User.class);
            dto.setEntityName(user.getFullName() + " (" + user.getUsername() + ")");
        } catch (Exception e) {
            dto.setEntityName("Unknown");
        }

        return dto;
    }
}
