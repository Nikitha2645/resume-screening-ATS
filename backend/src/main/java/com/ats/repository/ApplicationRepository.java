package com.ats.repository;

import com.ats.model.Application;
import com.ats.model.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findBySeekerId(Long seekerId);
    List<Application> findByJobPostingId(Long jobPostingId);
    List<Application> findByJobPostingIdOrderByScoreDesc(Long jobPostingId);
    boolean existsBySeekerIdAndJobPostingId(Long seekerId, Long jobPostingId);
    long countByStatus(ApplicationStatus status);
    List<Application> findByJobPostingIdIn(List<Long> jobPostingIds);
}
