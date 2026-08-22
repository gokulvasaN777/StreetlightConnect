package com.example.streetlight.backend.complaint;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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
        Complaint complaint = complaintService.submitComplaint(authentication, request);
        return ResponseEntity.ok(ComplaintDtos.ComplaintResponse.from(complaint));
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

    @GetMapping("/api/admin/complaints")
    public ResponseEntity<List<ComplaintDtos.ComplaintResponse>> allComplaints() {
        List<ComplaintDtos.ComplaintResponse> response = complaintService
                .getAllComplaints()
                .stream()
                .map(ComplaintDtos.ComplaintResponse::from)
                .toList();

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/api/admin/complaints/{id}/status")
    public ResponseEntity<ComplaintDtos.ComplaintResponse> updateStatus(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ComplaintDtos.StatusUpdateRequest request
    ) {
        Complaint complaint = complaintService.updateStatus(authentication, id, request);
        return ResponseEntity.ok(ComplaintDtos.ComplaintResponse.from(complaint));
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
        Complaint complaint = complaintService.attachImage(authentication, id, file);
        return ResponseEntity.ok(ComplaintDtos.ComplaintResponse.from(complaint));
    }
}