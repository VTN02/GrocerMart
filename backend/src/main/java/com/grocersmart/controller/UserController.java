package com.grocersmart.controller;

import com.grocersmart.dto.ApiResponse;
import com.grocersmart.dto.UserDto;
import com.grocersmart.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<UserDto>> createUser(@jakarta.validation.Valid @RequestBody UserDto dto) {
        // Enforce role assignment - only ADMIN can create accounts, and they can
        // specify roles.
        // The security config will already restrict this endpoint to ADMINs.
        UserDto created = userService.register(dto);
        return ResponseEntity.ok(ApiResponse.success(created, "User created successfully"));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> getProfile(java.security.Principal principal) {
        UserDto user = userService.getUserByUsername(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(user, "Profile retrieved successfully"));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @jakarta.validation.Valid @RequestBody com.grocersmart.dto.UpdateProfileRequest request,
            java.security.Principal principal) {
        UserDto updated = userService.updateProfile(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Profile updated successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<UserDto>>> getUsers(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String publicId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {

        String[] sortParts = sort.split(",");
        org.springframework.data.domain.Sort sortObj = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("desc")
                ? org.springframework.data.domain.Sort.by(sortParts[0]).descending()
                : org.springframework.data.domain.Sort.by(sortParts[0]).ascending();

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                sortObj);

        if (id != null) {
            try {
                UserDto user = userService.getUserById(id);
                return ResponseEntity.ok(ApiResponse.success(
                        new org.springframework.data.domain.PageImpl<>(java.util.Collections.singletonList(user),
                                pageable, 1),
                        "User retrieved successfully"));
            } catch (jakarta.persistence.EntityNotFoundException e) {
                return ResponseEntity.ok(
                        ApiResponse.success(org.springframework.data.domain.Page.empty(pageable), "User not found"));
            }
        }
        if (publicId != null) {
            try {
                UserDto user = userService.getUserByPublicId(publicId);
                return ResponseEntity.ok(ApiResponse.success(
                        new org.springframework.data.domain.PageImpl<>(java.util.Collections.singletonList(user),
                                pageable, 1),
                        "User retrieved successfully"));
            } catch (jakarta.persistence.EntityNotFoundException e) {
                return ResponseEntity.ok(
                        ApiResponse.success(org.springframework.data.domain.Page.empty(pageable), "User not found"));
            }
        }
        return ResponseEntity.ok(ApiResponse.success(
                userService.getUsers(search, role, status, pageable),
                "Users retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id), "User retrieved successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<UserDto>> searchUser(@RequestParam(required = false) Long id,
            @RequestParam(required = false) String publicId) {
        UserDto user = null;
        if (id != null) {
            user = userService.getUserById(id);
        } else if (publicId != null) {
            user = userService.getUserByPublicId(publicId);
        }
        if (user == null) {
            throw new jakarta.persistence.EntityNotFoundException("User not found");
        }
        return ResponseEntity.ok(ApiResponse.success(user, "User found"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(@PathVariable Long id, @RequestBody UserDto dto) {
        UserDto updated = userService.updateUser(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "User updated successfully"));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<UserDto>> activateUser(@PathVariable Long id) {
        UserDto updated = userService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.success(updated, "User activated successfully"));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<UserDto>> deactivateUser(@PathVariable Long id) {
        UserDto updated = userService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success(updated, "User deactivated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }
}
