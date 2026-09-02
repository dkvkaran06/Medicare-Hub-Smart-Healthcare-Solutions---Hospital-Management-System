package com.hospitalmanagement.service.impl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.hospitalmanagement.entity.User;
import com.hospitalmanagement.entity.UserRole;
import com.hospitalmanagement.entity.Patient;
import com.hospitalmanagement.entity.Doctor;
import com.hospitalmanagement.entity.Department;
import com.hospitalmanagement.repository.UserRepository;
import com.hospitalmanagement.repository.PatientRepository;
import com.hospitalmanagement.repository.DoctorRepository;
import com.hospitalmanagement.repository.DepartmentRepository;
import com.hospitalmanagement.security.JwtService;
import com.hospitalmanagement.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    private static final int MAX_ADMINS = 5;

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(UserRepository userRepository, 
                           PatientRepository patientRepository,
                           DoctorRepository doctorRepository,
                           DepartmentRepository departmentRepository,
                           PasswordEncoder passwordEncoder, 
                           JwtService jwtService) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public Map<String, Object> register(Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String password = request.get("password");
        String role = request.get("role");

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

        // Auto-create Patient or Doctor profile
        if (userRole == UserRole.PATIENT) {
            Patient patient = Patient.builder()
                    .name(name)
                    .email(email)
                    .age(request.get("age") != null && !request.get("age").isEmpty() ? Integer.parseInt(request.get("age")) : 0)
                    .gender(request.getOrDefault("gender", "Unknown"))
                    .phone(request.getOrDefault("phone", ""))
                    .address(request.getOrDefault("address", ""))
                    .bloodGroup(request.getOrDefault("bloodGroup", ""))
                    .build();
            patientRepository.save(patient);
        } else if (userRole == UserRole.DOCTOR) {
            Doctor doctor = Doctor.builder()
                    .name(name)
                    .email(email)
                    .phone(request.getOrDefault("phone", ""))
                    .specialization(request.getOrDefault("specialization", ""))
                    .build();
            
            String deptIdStr = request.get("departmentId");
            if (deptIdStr != null && !deptIdStr.isEmpty()) {
                departmentRepository.findById(Long.parseLong(deptIdStr)).ifPresent(doctor::setDepartment);
            }
            doctorRepository.save(doctor);
        }

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
    @Override
    public Map<String, Object> me(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return buildUserResponse(user);
    }

    @Override
    public Map<String, Object> updateMe(String email, Map<String, String> request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.containsKey("name") && !request.get("name").isEmpty()) {
            user.setName(request.get("name"));
            // Also update the name in Patient or Doctor profile
            if (user.getRole() == UserRole.PATIENT) {
                patientRepository.findByEmail(email).ifPresent(p -> {
                    p.setName(request.get("name"));
                    patientRepository.save(p);
                });
            } else if (user.getRole() == UserRole.DOCTOR) {
                doctorRepository.findByEmail(email).ifPresent(d -> {
                    d.setName(request.get("name"));
                    doctorRepository.save(d);
                });
            }
        }

        if (request.containsKey("newPassword") && !request.get("newPassword").isEmpty()) {
            String oldPassword = request.get("oldPassword");
            String stored = user.getPassword();
            boolean looksHashed = stored != null && (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$"));
            boolean matches = looksHashed ? passwordEncoder.matches(oldPassword, stored) : (stored != null && stored.equals(oldPassword));
            
            if (!matches) {
                throw new RuntimeException("Incorrect old password.");
            }
            user.setPassword(passwordEncoder.encode(request.get("newPassword")));
        }

        User savedUser = userRepository.save(user);
        return buildUserResponse(savedUser);
    }

    @Override
    public void deleteMe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() == UserRole.PATIENT) {
            patientRepository.findByEmail(email).ifPresent(patientRepository::delete);
        } else if (user.getRole() == UserRole.DOCTOR) {
            doctorRepository.findByEmail(email).ifPresent(doctorRepository::delete);
        }
        
        userRepository.delete(user);
    }
}
