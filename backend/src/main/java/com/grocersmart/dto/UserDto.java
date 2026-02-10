package com.grocersmart.dto;

import com.grocersmart.entity.User;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Data
public class UserDto {
    private Long id;

    @NotBlank(message = "Full Name is required")
    private String fullName;

    @NotBlank(message = "Username is required")
    @Size(min = 4, message = "Username must be at least 4 chars")
    private String username;

    private String phone;
    private User.Role role;
    private User.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // For registration only (optional in response)
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 chars")
    private String password;
}
