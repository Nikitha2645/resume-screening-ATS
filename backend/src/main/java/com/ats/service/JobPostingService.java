package com.ats.service;

import com.ats.model.JobPosting;
import com.ats.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobPostingService {
    
    private final JobPostingRepository jobPostingRepository;
    private final com.ats.repository.UserRepository userRepository;

    private final com.ats.repository.RecruiterProfileRepository recruiterProfileRepository;

    public List<JobPosting> getAllJobs() {
        return jobPostingRepository.findAll();
    }

    public JobPosting createJob(JobPosting jobPosting, Long recruiterId) {
        if (recruiterId == null || recruiterId <= 0) {
            throw new RuntimeException("Valid Recruiter ID is required to post a job.");
        }
        
        com.ats.model.User recruiter = userRepository.findById(recruiterId)
            .orElseThrow(() -> new RuntimeException("Recruiter with ID " + recruiterId + " not found"));
        
        jobPosting.setPostedBy(recruiter);
        
        // Fetch company name from recruiter profile
        String company = recruiterProfileRepository.findByRecruiterId(recruiterId)
                .map(com.ats.model.RecruiterProfile::getCompanyName)
                .orElse(recruiter.getName());
        
        jobPosting.setCompany(company);

        // 1. Prevent duplicate jobs (same title + description)
        if (jobPostingRepository.existsByTitleAndDescription(jobPosting.getTitle(), jobPosting.getDescription())) {
            throw new RuntimeException("A job with this title and description already exists.");
        }

        // 2. Deadline validation (must be within 14 days from today)
        if (jobPosting.getApplicationDeadline() != null) {
            LocalDate today = LocalDate.now();
            LocalDate maxDate = today.plusDays(14);
            if (jobPosting.getApplicationDeadline().isAfter(maxDate)) {
                throw new RuntimeException("Application deadline must be within 14 days from today.");
            }
            if (jobPosting.getApplicationDeadline().isBefore(today)) {
                throw new RuntimeException("Application deadline cannot be in the past.");
            }
        }

        return jobPostingRepository.save(jobPosting);
    }

    public JobPosting getJobById(Long id) {
        return jobPostingRepository.findById(id).orElse(null);
    }

    public void deleteJobById(Long id) {
        if (!jobPostingRepository.existsById(id)) {
            throw new RuntimeException("Job not found with id: " + id);
        }
        jobPostingRepository.deleteById(id);
    }

    public List<JobPosting> getJobsByRecruiter(Long recruiterId) {
        return jobPostingRepository.findByPostedById(recruiterId);
    }
}
