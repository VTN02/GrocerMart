package com.grocersmart.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class UpdateProfileRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Full Name is required")
    private String fullName;

    private String phone;

    private String oldPassword;
    private String newPassword;
}
