package com.hospitalmanagement.service.impl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.hospitalmanagement.entity.User;
import com.hospitalmanagement.entity.UserRole;
import com.hospitalmanagement.repository.UserRepository;
import com.hospitalmanagement.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    private static final int MAX_ADMINS = 5;

    private final UserRepository userRepository;

    public AuthServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public Map<String, Object> register(String name, String email, String password, String role) {
        // Check if email is already registered
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("This email is already registered. One account per email is allowed.");
        }

        // Parse and validate role
        UserRole userRole;
        try {
            userRole = UserRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role. Must be ADMIN, DOCTOR, or PATIENT.");
        }

        // Enforce admin limit
        if (userRole == UserRole.ADMIN) {
            long adminCount = userRepository.countByRole(UserRole.ADMIN);
            if (adminCount >= MAX_ADMINS) {
                throw new RuntimeException("Maximum number of administrators (" + MAX_ADMINS + ") has been reached. Cannot register more admins.");
            }
        }

        // Create and save user
        User user = User.builder()
                .name(name)
                .email(email)
                .password(password)
                .role(userRole)
                .createdAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        return buildUserResponse(savedUser);
    }

    @Override
    public Map<String, Object> login(String email, String password) {
        // Find user by email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email. Please register first."));

        // Validate password
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Incorrect password. Please try again.");
        }

        return buildUserResponse(user);
    }

    private Map<String, Object> buildUserResponse(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name().toLowerCase());
        return response;
    }
}
