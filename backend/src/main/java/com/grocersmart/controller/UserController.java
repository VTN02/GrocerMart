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

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @jakarta.validation.Valid @RequestBody com.grocersmart.dto.UpdateProfileRequest request,
            java.security.Principal principal) {
        UserDto updated = userService.updateProfile(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Profile updated successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers(@RequestParam(required = false) Long id) {
        if (id != null) {
            try {
                UserDto user = userService.getUserById(id);
                return ResponseEntity.ok(
                        ApiResponse.success(java.util.Collections.singletonList(user), "User retrieved successfully"));
            } catch (jakarta.persistence.EntityNotFoundException e) {
                return ResponseEntity.ok(ApiResponse.success(java.util.Collections.emptyList(), "User not found"));
            }
        }
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers(), "Users retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id), "User retrieved successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<UserDto>> searchUser(@RequestParam Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id), "User found"));
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
