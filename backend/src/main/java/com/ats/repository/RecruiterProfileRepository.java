package com.ats.repository;

import com.ats.model.RecruiterProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RecruiterProfileRepository extends JpaRepository<RecruiterProfile, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT p FROM RecruiterProfile p WHERE p.recruiter.id = :recruiterId")
    Optional<RecruiterProfile> findByRecruiterId(@org.springframework.data.repository.query.Param("recruiterId") Long recruiterId);
}
