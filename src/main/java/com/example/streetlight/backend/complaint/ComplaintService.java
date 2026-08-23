package com.example.streetlight.backend.complaint;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.streetlight.backend.audit.AuditService;
import com.example.streetlight.backend.user.Role;
import com.example.streetlight.backend.user.User;
import com.example.streetlight.backend.user.UserRepository;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private final FileStorageService fileStorageService;

    public ComplaintService(
            ComplaintRepository complaintRepository,
            UserRepository userRepository,
            AuditService auditService,
            FileStorageService fileStorageService
    ) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
        this.fileStorageService = fileStorageService;
    }

    private User currentUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    private void requireAdmin(Authentication authentication) {
    boolean isAdmin = authentication.getAuthorities()
            .stream()
            .anyMatch(authority ->
                    authority.getAuthority().equals("ROLE_ADMIN")
            );

    if (!isAdmin) {
        throw new org.springframework.security.access.AccessDeniedException(
                "Only administrators can access this resource"
        );
    }
}

    public Complaint submitComplaint(
            Authentication authentication,
            ComplaintDtos.ComplaintRequest request
    ) {
        User user = currentUser(authentication);

        Complaint complaint = new Complaint();
        complaint.setUser(user);
        complaint.setLocation(request.location().trim());
        complaint.setDescription(request.description().trim());
        complaint.setStatus(ComplaintStatus.PENDING);

        Complaint saved = complaintRepository.save(complaint);

        auditService.log(user, "COMPLAINT_SUBMITTED at " + saved.getLocation());

        return saved;
    }

    public List<Complaint> getMyComplaints(Authentication authentication) {
        User user = currentUser(authentication);
        return complaintRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Transactional(readOnly = true)
public Complaint getComplaintById(
        Authentication authentication,
        Long complaintId
) {
    Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Complaint not found")
            );

    User user = currentUser(authentication);
    boolean isAdmin = hasAdminRole(authentication);
    boolean isOwner = complaint.getUser().getId().equals(user.getId());

    if (!isOwner && !isAdmin) {
        throw new AccessDeniedException(
                "You can only view your own complaints"
        );
    }

    return complaint;
}

@Transactional(readOnly = true)
public ComplaintDtos.ComplaintResponse getComplaintResponseById(
        Authentication authentication,
        Long complaintId
) {
    Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Complaint not found")
            );

    User user = currentUser(authentication);
    boolean isAdmin = hasAdminRole(authentication);
    boolean isOwner = complaint.getUser().getId().equals(user.getId());

    if (!isOwner && !isAdmin) {
        throw new AccessDeniedException(
                "You can only view your own complaints"
        );
    }

    return ComplaintDtos.ComplaintResponse.from(complaint);
}

    public List<Complaint> getAllComplaints(
        Authentication authentication
) {
    requireAdmin(authentication);

    return complaintRepository.findAllByOrderByCreatedAtDesc();
}

    public List<ComplaintDtos.TechnicianResponse> getTechnicians(
            Authentication authentication
    ) {
        requireAdmin(authentication);

        return userRepository.findByRole(Role.TECHNICIAN)
                .stream()
                .map(user -> new ComplaintDtos.TechnicianResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail()
                ))
                .toList();
    }

    @Transactional
    public Complaint assignTechnician(
            Authentication authentication,
            Long complaintId,
            Long technicianId
    ) {
        requireAdmin(authentication);

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Complaint not found")
                );

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Technician not found")
                );

        if (!"TECHNICIAN".equalsIgnoreCase(technician.getRole().toString())) {
            throw new IllegalArgumentException(
                    "Selected user is not a technician"
            );
        }

        complaint.setAssignedTechnician(technician);
        complaint.setAssignedAt(LocalDateTime.now());

        if (complaint.getStatus() == ComplaintStatus.PENDING) {
            complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        }

        complaint.setUpdatedAt(LocalDateTime.now());

        Complaint saved = complaintRepository.save(complaint);

        User admin = currentUser(authentication);
        auditService.log(
                admin,
                "TECHNICIAN_ASSIGNED #" + complaintId
                        + " -> " + technician.getEmail()
        );

        return saved;
    }

    public Complaint updateStatus(
            Authentication authentication,
            Long complaintId,
            ComplaintDtos.StatusUpdateRequest request
    ) {
        requireAdmin(authentication);

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Complaint not found")
                );

        ComplaintStatus newStatus;

        try {
            newStatus = ComplaintStatus.valueOf(
                    request.status().toUpperCase()
            );
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid status value");
        }

        complaint.setStatus(newStatus);
        complaint.setAdminRemarks(request.adminRemarks());
        complaint.setUpdatedAt(LocalDateTime.now());

        Complaint saved = complaintRepository.save(complaint);

        User admin = currentUser(authentication);
        auditService.log(
                admin,
                "COMPLAINT_STATUS_UPDATED #" + complaintId
                        + " -> " + newStatus
        );

        return saved;
    }

    public void deleteComplaint(
            Authentication authentication,
            Long complaintId
    ) {
        requireAdmin(authentication);

        if (!complaintRepository.existsById(complaintId)) {
            throw new IllegalArgumentException("Complaint not found");
        }

        complaintRepository.deleteById(complaintId);

        User admin = currentUser(authentication);
        auditService.log(admin, "COMPLAINT_DELETED #" + complaintId);
    }

    public Complaint attachImage(
            Authentication authentication,
            Long complaintId,
            MultipartFile file
    ) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Complaint not found")
                );

        User user = currentUser(authentication);

        if (!complaint.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException(
                    "You can only attach images to your own complaints"
            );
        }

        String storedFileName = fileStorageService.store(file);
        complaint.setImagePath(storedFileName);

        Complaint saved = complaintRepository.save(complaint);

        auditService.log(user, "IMAGE_UPLOADED for complaint #" + complaintId);

        return saved;
    }

    private boolean hasAdminRole(Authentication authentication) {
        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN")
                                || authority.getAuthority().equals("ROLE_MUNICIPAL_OFFICER")
                );
    }
}