package com.grocersmart.service;

import com.grocersmart.dto.AuthRegisterRequest;
import com.grocersmart.dto.UserDto;
import com.grocersmart.entity.User;
import com.grocersmart.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.grocersmart.security.JwtTokenProvider tokenProvider;

    public com.grocersmart.dto.AuthResponse register(AuthRegisterRequest request) {
        if (userRepository.count() > 0) {
            throw new IllegalArgumentException(
                    "Registration is closed. Please contact administrator to create an account.");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        User user = new User();
        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setPhone(request.getPhone());
        user.setRole(User.Role.ADMIN); // First user is always ADMIN
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setStatus(User.Status.ACTIVE);

        User saved = userRepository.save(user);
        String token = tokenProvider.generateToken(saved.getUsername());
        return new com.grocersmart.dto.AuthResponse("Registration successful", saved.getRole().name(),
                saved.getUsername(), token);
    }

    public UserDto register(UserDto dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        User user = new User();
        user.setFullName(dto.getFullName());
        user.setUsername(dto.getUsername());
        user.setPhone(dto.getPhone());
        user.setRole(dto.getRole());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setStatus(User.Status.ACTIVE);

        User saved = userRepository.save(user);
        return mapToDto(saved);
    }

    public com.grocersmart.dto.AuthResponse login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        if (user.getStatus() != User.Status.ACTIVE) {
            throw new IllegalArgumentException("User is INACTIVE. Please contact admin.");
        }

        String token = tokenProvider.generateToken(user.getUsername());
        return new com.grocersmart.dto.AuthResponse("Login successful", user.getRole().name(), user.getUsername(),
                token);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::mapToDto)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
    }

    public UserDto updateUser(Long id, UserDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        if (dto.getRole() != null)
            user.setRole(dto.getRole());

        return mapToDto(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        // Soft delete
        user.setStatus(User.Status.INACTIVE);
        userRepository.save(user);
    }

    @Transactional
    public UserDto activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        user.setStatus(User.Status.ACTIVE);
        return mapToDto(userRepository.save(user));
    }

    @Transactional
    public UserDto deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        user.setStatus(User.Status.INACTIVE);
        return mapToDto(userRepository.save(user));
    }

    @Transactional
    public UserDto updateProfile(String currentUsername, com.grocersmart.dto.UpdateProfileRequest request) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // If password change is requested
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getOldPassword() == null || request.getOldPassword().isBlank()) {
                throw new IllegalArgumentException("Current password is required to set a new password");
            }
            if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
                throw new IllegalArgumentException("Current password does not match");
            }
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        }

        // If username change is requested
        if (!user.getUsername().equals(request.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new IllegalArgumentException("Username already exists");
            }
            user.setUsername(request.getUsername());
        }

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());

        return mapToDto(userRepository.save(user));
    }

    public boolean isInitialized() {
        return userRepository.count() > 0;
    }

    private UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setUsername(user.getUsername());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}
