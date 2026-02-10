package com.grocersmart.dto;

import com.grocersmart.entity.User;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AuthRegisterRequest {

    @NotBlank(message = "Full Name is required")
    private String fullName;

    @NotBlank(message = "Username is required")
    @Size(min = 4, message = "Username must be at least 4 chars")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 chars")
    private String password;

    private String phone;

    @NotNull(message = "Role is required")
    private User.Role role;
}
