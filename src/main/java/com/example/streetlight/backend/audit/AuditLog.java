package com.example.streetlight.backend.audit;

import com.example.streetlight.backend.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 255)
    private String action;

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public AuditLog() {
    }

    public AuditLog(User user, String action) {
        this.user = user;
        this.action = action;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getAction() { return action; }
    public LocalDateTime getTimestamp() { return timestamp; }
}