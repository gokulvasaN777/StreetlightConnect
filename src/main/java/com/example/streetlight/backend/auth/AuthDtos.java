package com.example.streetlight.backend.auth;

import jakarta.validation.constraints.*;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank(message = "Name is required")
            @Size(max = 100)
            String name,

            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email")
            String email,

            @NotBlank(message = "Password is required")
            @Size(min = 8, max = 100)
            String password
    ) {
    }

    public record LoginRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email")
            String email,

            @NotBlank(message = "Password is required")
            String password
    ) {
    }

    public record AuthResponse(
            String token,
            String email,
            String role
    ) {
    }
}