package com.example.streetlight.backend.audit;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/audit-logs")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public ResponseEntity<List<AuditLogDtos.AuditLogResponse>> getLogs() {
        List<AuditLogDtos.AuditLogResponse> response = auditLogRepository
                .findAllByOrderByTimestampDesc()
                .stream()
                .map(AuditLogDtos.AuditLogResponse::from)
                .toList();

        return ResponseEntity.ok(response);
    }
}