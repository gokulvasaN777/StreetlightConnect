package com.example.streetlight.backend.complaint;

import com.example.streetlight.backend.audit.AuditService;
import com.example.streetlight.backend.user.User;
import com.example.streetlight.backend.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

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

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    public Complaint updateStatus(
            Authentication authentication,
            Long complaintId,
            ComplaintDtos.StatusUpdateRequest request
    ) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found"));

        ComplaintStatus newStatus;

        try {
            newStatus = ComplaintStatus.valueOf(request.status().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid status value");
        }

        complaint.setStatus(newStatus);
        complaint.setAdminRemarks(request.adminRemarks());
        complaint.setUpdatedAt(LocalDateTime.now());

        Complaint saved = complaintRepository.save(complaint);

        User admin = currentUser(authentication);
        auditService.log(admin, "COMPLAINT_STATUS_UPDATED #" + complaintId + " -> " + newStatus);

        return saved;
    }

    public void deleteComplaint(Authentication authentication, Long complaintId) {
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
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found"));

        User user = currentUser(authentication);

        if (!complaint.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("You can only attach images to your own complaints");
        }

        String storedFileName = fileStorageService.store(file);
        complaint.setImagePath(storedFileName);

        Complaint saved = complaintRepository.save(complaint);

        auditService.log(user, "IMAGE_UPLOADED for complaint #" + complaintId);

        return saved;
    }
}