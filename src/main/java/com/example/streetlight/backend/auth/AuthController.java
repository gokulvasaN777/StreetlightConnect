package com.example.streetlight.backend.auth;

import com.example.streetlight.backend.audit.AuditService;
import com.example.streetlight.backend.security.JwtService;
import com.example.streetlight.backend.user.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final AuditService auditService;

    public AuthController(
            UserService userService,
            UserRepository userRepository,
            AuthenticationManager authenticationManager,
            CustomUserDetailsService userDetailsService,
            JwtService jwtService,
            AuditService auditService
    ) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody AuthDtos.RegisterRequest request
    ) {
        User user = userService.registerCitizen(request);
        auditService.log(user, "ACCOUNT_REGISTERED");

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("Citizen registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDtos.AuthResponse> login(
            @Valid @RequestBody AuthDtos.LoginRequest request
    ) {
        String email = request.email().trim().toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password())
        );

        User user = userRepository.findByEmail(email).orElseThrow();

        UserDetails details = userDetailsService.loadUserByUsername(email);
        String token = jwtService.generateToken(details);

        auditService.log(user, "LOGIN_SUCCESS");

        return ResponseEntity.ok(
                new AuthDtos.AuthResponse(token, user.getEmail(), user.getRole().name())
        );
    }
}