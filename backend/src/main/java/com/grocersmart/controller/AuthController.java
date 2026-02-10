package com.grocersmart.controller;

import com.grocersmart.dto.ApiResponse;
import com.grocersmart.dto.AuthLoginRequest;
import com.grocersmart.dto.AuthRegisterRequest;
import com.grocersmart.dto.AuthResponse;
import com.grocersmart.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @jakarta.validation.Valid @RequestBody AuthRegisterRequest request) {
        AuthResponse response = userService.register(request);
        return ResponseEntity.ok(ApiResponse.success(response, "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @jakarta.validation.Valid @RequestBody AuthLoginRequest request) {
        AuthResponse response = userService.login(request.getUsername(), request.getPassword());
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<java.util.Map<String, Boolean>>> getStatus() {
        java.util.Map<String, Boolean> status = new java.util.HashMap<>();
        status.put("initialized", userService.isInitialized());
        return ResponseEntity.ok(ApiResponse.success(status, "Status retrieved successfully"));
    }
}
