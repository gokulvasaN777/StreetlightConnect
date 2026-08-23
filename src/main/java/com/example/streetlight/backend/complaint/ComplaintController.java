package com.example.streetlight.backend.complaint;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;

@RestController
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping("/api/complaints")
    public ResponseEntity<ComplaintDtos.ComplaintResponse> submit(
            Authentication authentication,
            @Valid @RequestBody ComplaintDtos.ComplaintRequest request
    ) {
        Complaint complaint = complaintService.submitComplaint(
                authentication,
                request
        );

        return ResponseEntity.ok(
                ComplaintDtos.ComplaintResponse.from(complaint)
        );
    }

    @GetMapping("/api/complaints/my")
    public ResponseEntity<List<ComplaintDtos.ComplaintResponse>> myComplaints(
            Authentication authentication
    ) {
        List<ComplaintDtos.ComplaintResponse> response = complaintService
                .getMyComplaints(authentication)
                .stream()
                .map(ComplaintDtos.ComplaintResponse::from)
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/complaints/{id}")
public ResponseEntity<ComplaintDtos.ComplaintResponse> getComplaintById(
        Authentication authentication,
        @PathVariable Long id
) {
    return ResponseEntity.ok(
            complaintService.getComplaintResponseById(
                    authentication,
                    id
            )
    );
}

    @GetMapping("/api/admin/complaints")
public ResponseEntity<List<ComplaintDtos.ComplaintResponse>> allComplaints(
        Authentication authentication
) {
    List<ComplaintDtos.ComplaintResponse> response = complaintService
            .getAllComplaints(authentication)
            .stream()
            .map(ComplaintDtos.ComplaintResponse::from)
            .toList();

    return ResponseEntity.ok(response);
}

    @GetMapping("/api/admin/technicians")
    public ResponseEntity<List<ComplaintDtos.TechnicianResponse>> technicians(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                complaintService.getTechnicians(authentication)
        );
    }

    @PatchMapping("/api/admin/complaints/{id}/assign-technician")
    public ResponseEntity<ComplaintDtos.ComplaintResponse> assignTechnician(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ComplaintDtos.AssignTechnicianRequest request
    ) {
        Complaint complaint = complaintService.assignTechnician(
                authentication,
                id,
                request.technicianId()
        );

        return ResponseEntity.ok(
                ComplaintDtos.ComplaintResponse.from(complaint)
        );
    }

    @PatchMapping("/api/admin/complaints/{id}/status")
    public ResponseEntity<ComplaintDtos.ComplaintResponse> updateStatus(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ComplaintDtos.StatusUpdateRequest request
    ) {
        Complaint complaint = complaintService.updateStatus(
                authentication,
                id,
                request
        );

        return ResponseEntity.ok(
                ComplaintDtos.ComplaintResponse.from(complaint)
        );
    }

    @DeleteMapping("/api/admin/complaints/{id}")
    public ResponseEntity<Void> delete(
            Authentication authentication,
            @PathVariable Long id
    ) {
        complaintService.deleteComplaint(authentication, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/complaints/{id}/image")
    public ResponseEntity<ComplaintDtos.ComplaintResponse> uploadImage(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        Complaint complaint = complaintService.attachImage(
                authentication,
                id,
                file
        );

        return ResponseEntity.ok(
                ComplaintDtos.ComplaintResponse.from(complaint)
        );
    }
}