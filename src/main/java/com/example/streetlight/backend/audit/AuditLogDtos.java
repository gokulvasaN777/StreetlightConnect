package com.example.streetlight.backend.audit;

import java.time.LocalDateTime;

public final class AuditLogDtos {

    private AuditLogDtos() {
    }

    public record AuditLogResponse(
            Long id,
            String userEmail,
            String action,
            LocalDateTime timestamp
    ) {
        public static AuditLogResponse from(AuditLog log) {
            return new AuditLogResponse(
                    log.getId(),
                    log.getUser() != null ? log.getUser().getEmail() : "SYSTEM",
                    log.getAction(),
                    log.getTimestamp()
            );
        }
    }
}