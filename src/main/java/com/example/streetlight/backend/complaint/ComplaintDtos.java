package com.example.streetlight.backend.complaint;

import com.example.streetlight.backend.user.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

public final class ComplaintDtos {

    private ComplaintDtos() {
    }

    public record ComplaintRequest(
            @NotBlank(message = "Location is required")
            @Size(max = 255, message = "Location must not exceed 255 characters")
            String location,

            @NotBlank(message = "Description is required")
            @Size(max = 1000, message = "Description must not exceed 1000 characters")
            String description
    ) {
    }

    public record StatusUpdateRequest(
            @NotBlank(message = "Status is required")
            String status,

            @Size(max = 500, message = "Admin remarks must not exceed 500 characters")
            String adminRemarks
    ) {
    }

    public record AssignTechnicianRequest(
            @NotNull(message = "Technician must be assigned")
            Long technicianId
    ) {
    }

    public record TechnicianResponse(
            Long id,
            String name,
            String email
    ) {
        public static TechnicianResponse from(User technician) {
            return new TechnicianResponse(
                    technician.getId(),
                    technician.getName(),
                    technician.getEmail()
            );
        }
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
            LocalDateTime updatedAt,
            LocalDateTime assignedAt,
            LocalDate expectedCompletionDate,
            TechnicianResponse assignedTechnician
    ) {
        public static ComplaintResponse from(Complaint complaint) {
            TechnicianResponse technician = null;

            if (complaint.getAssignedTechnician() != null) {
                technician = TechnicianResponse.from(
                        complaint.getAssignedTechnician()
                );
            }

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
                    complaint.getUpdatedAt(),
                    complaint.getAssignedAt(),
                    complaint.getExpectedCompletionDate(),
                    technician
            );
        }
    }
}