package com.ats.repository;

import com.ats.model.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    boolean existsByTitleAndDescription(String title, String description);
    List<JobPosting> findByPostedById(Long userId);
}
