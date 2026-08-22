package com.example.streetlight.backend.complaint;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public final class ComplaintDtos {

    private ComplaintDtos() {
    }

    public record ComplaintRequest(
            @NotBlank(message = "Location is required")
            @Size(max = 255)
            String location,

            @NotBlank(message = "Description is required")
            @Size(max = 1000)
            String description
    ) {
    }

    public record StatusUpdateRequest(
            @NotBlank(message = "Status is required")
            String status,

            @Size(max = 500)
            String adminRemarks
    ) {
    }

    public record ComplaintResponse(
            Long id,
            String citizenName,
            String citizenEmail,
            String location,
            String description,
            String imagePath,
            String status,
            String adminRemarks,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        public static ComplaintResponse from(Complaint complaint) {
            return new ComplaintResponse(
                    complaint.getId(),
                    complaint.getUser().getName(),
                    complaint.getUser().getEmail(),
                    complaint.getLocation(),
                    complaint.getDescription(),
                    complaint.getImagePath(),
                    complaint.getStatus().name(),
                    complaint.getAdminRemarks(),
                    complaint.getCreatedAt(),
                    complaint.getUpdatedAt()
            );
        }
    }
}