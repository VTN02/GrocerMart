package com.grocersmart.controller;

import com.grocersmart.common.ModuleKey;
import com.grocersmart.dto.ApiResponse;
import com.grocersmart.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/permissions/cashier")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCashierPermissions() {
        Map<ModuleKey, Boolean> permissions = permissionService.getCashierPermissions();
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("role", "CASHIER", "permissions", permissions),
                "Permissions retrieved successfully"));
    }

    @PutMapping("/{moduleKey}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updatePermission(
            @PathVariable ModuleKey moduleKey,
            @RequestBody Map<String, Boolean> body) {
        Boolean allowed = body.get("allowed");
        if (allowed == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Field 'allowed' is required"));
        }
        permissionService.setCashierPermission(moduleKey, allowed);
        return ResponseEntity.ok(ApiResponse.success(null, "Permission updated successfully"));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> bulkUpdatePermissions(@RequestBody Map<String, Object> body) {
        Map<String, Boolean> permissionsMap = (Map<String, Boolean>) body.get("permissions");
        if (permissionsMap == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Field 'permissions' is required"));
        }

        Map<ModuleKey, Boolean> bulkUpdate = permissionsMap.entrySet().stream()
                .collect(java.util.stream.Collectors.toMap(
                        e -> ModuleKey.valueOf(e.getKey()),
                        Map.Entry::getValue));

        permissionService.setBulkCashierPermissions(bulkUpdate);
        return ResponseEntity.ok(ApiResponse.success(null, "Bulk permissions updated successfully"));
    }
}
