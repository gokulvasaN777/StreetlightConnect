package com.example.streetlight.backend.config;

import com.example.streetlight.backend.user.Role;
import com.example.streetlight.backend.user.User;
import com.example.streetlight.backend.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminDataInitializer {

    @Bean
    CommandLineRunner createAdminUser(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            String adminEmail = "admin@streetlight.com";

            if (!userRepository.existsByEmail(adminEmail)) {
                User admin = new User(
                        "Municipal Admin",
                        adminEmail,
                        passwordEncoder.encode("Admin@12345"),
                        Role.ADMIN
                );
                userRepository.save(admin);
            }
        };
    }
}