package com.hospitalmanagement.service.impl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.hospitalmanagement.entity.User;
import com.hospitalmanagement.entity.UserRole;
import com.hospitalmanagement.repository.UserRepository;
import com.hospitalmanagement.security.JwtService;
import com.hospitalmanagement.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    private static final int MAX_ADMINS = 5;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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

        // Create and save user (password stored as a BCrypt hash, never plaintext)
        User user = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(password))
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

        // Validate password. Existing accounts created before hashing was added
        // still hold a plaintext password, so migrate them on the fly: if the
        // stored value is already a BCrypt hash verify with the encoder, otherwise
        // compare as plaintext and, on success, re-save it hashed (one-time upgrade).
        String stored = user.getPassword();
        boolean looksHashed = stored != null
                && (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$"));
        boolean matches;
        if (looksHashed) {
            matches = passwordEncoder.matches(password, stored);
        } else {
            matches = stored != null && stored.equals(password);
            if (matches) {
                user.setPassword(passwordEncoder.encode(password));
                userRepository.save(user);
            }
        }
        if (!matches) {
            throw new RuntimeException("Incorrect password. Please try again.");
        }

        return buildUserResponse(user);
    }

    private Map<String, Object> buildUserResponse(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        // Response role stays lowercase (the frontend compares 'admin'/'doctor'/'patient');
        // the JWT claim carries the UPPERCASE enum name so the filter builds ROLE_ADMIN etc.
        response.put("role", user.getRole().name().toLowerCase());
        response.put("token", jwtService.generateToken(user.getEmail(), user.getRole().name()));
        return response;
    }
}
