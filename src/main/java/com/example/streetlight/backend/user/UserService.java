package com.example.streetlight.backend.user;

import com.example.streetlight.backend.auth.AuthDtos;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerCitizen(AuthDtos.RegisterRequest request) {
        String name = request.name() == null
                ? ""
                : request.name().trim();

        String email = request.email() == null
                ? ""
                : request.email().trim().toLowerCase();

        if (name.isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }

        if (email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        if (request.password() == null || request.password().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "Email is already registered"
            );
        }

        User user = new User(
                name,
                email,
                passwordEncoder.encode(request.password()),
                Role.CITIZEN
        );

        return userRepository.save(user);
    }

    @Transactional
    public User createTechnician(
            String name,
            String email,
            String temporaryPassword
    ) {
        String normalizedName = name == null ? "" : name.trim();
        String normalizedEmail = email == null
                ? ""
                : email.trim().toLowerCase();

        if (normalizedName.isBlank()) {
            throw new IllegalArgumentException("Technician name is required");
        }

        if (normalizedEmail.isBlank()) {
            throw new IllegalArgumentException(
                    "Technician email is required"
            );
        }

        if (temporaryPassword == null || temporaryPassword.isBlank()) {
            throw new IllegalArgumentException(
                    "Technician password is required"
            );
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "Email is already registered"
            );
        }

        User technician = new User(
                normalizedName,
                normalizedEmail,
                passwordEncoder.encode(temporaryPassword),
                Role.TECHNICIAN
        );

        return userRepository.save(technician);
    }
}