package com.grocersmart.controller;

import com.grocersmart.dto.ApiResponse;
import com.grocersmart.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/reset-system")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resetSystem(@RequestBody Map<String, String> request) {
        String confirm = request.get("confirm");

        if (!"RESET".equals(confirm)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid confirmation. Must type 'RESET'."));
        }

        Map<String, Object> result = adminService.resetSystem();
        return ResponseEntity.ok(ApiResponse.success(result, "System reset successful"));
    }
}
