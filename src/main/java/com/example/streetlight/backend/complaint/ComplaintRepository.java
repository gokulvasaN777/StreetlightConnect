package com.example.streetlight.backend.complaint;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.streetlight.backend.user.User;

public interface ComplaintRepository
        extends JpaRepository<Complaint, Long> {

    @EntityGraph(attributePaths = {"user", "assignedTechnician"})
    List<Complaint> findByUserOrderByCreatedAtDesc(User user);

    @EntityGraph(attributePaths = {"user", "assignedTechnician"})
    List<Complaint> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"user", "assignedTechnician"})
    Optional<Complaint> findWithUsersById(Long id);

     @EntityGraph(attributePaths = {
        "user"
    })
    Optional<Complaint> findById(Long id);
}