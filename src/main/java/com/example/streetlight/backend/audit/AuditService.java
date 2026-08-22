package com.example.streetlight.backend.audit;

import com.example.streetlight.backend.user.User;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(User user, String action) {
        auditLogRepository.save(new AuditLog(user, action));
    }
}