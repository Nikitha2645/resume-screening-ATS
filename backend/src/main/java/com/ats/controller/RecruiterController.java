package com.ats.controller;

import com.ats.model.Application;
import com.ats.model.JobPosting;
import com.ats.repository.ApplicationRepository;
import com.ats.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recruiter")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RecruiterController {

    private final JobPostingRepository jobPostingRepository;
    private final ApplicationRepository applicationRepository;

    @GetMapping("/applications/{recruiterId}")
    public ResponseEntity<?> getRecruiterApplications(@PathVariable Long recruiterId) {
        System.out.println(">>> REQUEST: GET /api/recruiter/applications/ recruiter ID: " + recruiterId);
        
        // 1. Get jobs posted by this recruiter
        List<JobPosting> jobs = jobPostingRepository.findByPostedById(recruiterId);
        System.out.println("Found " + jobs.size() + " jobs for recruiter " + recruiterId);
        
        if (jobs.isEmpty()) {
            System.out.println("<<< RESPONSE: 200 - No jobs found for recruiter " + recruiterId);
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<Long> jobIds = jobs.stream().map(JobPosting::getId).collect(Collectors.toList());
        System.out.println("Searching applications for job IDs: " + jobIds);

        // 2. Fetch applications where jobId IN recruiter’s jobs
        List<Application> apps = applicationRepository.findByJobPostingIdIn(jobIds);
        System.out.println("Found " + apps.size() + " total applications linked to these jobs");
        
        // 3. Transform for frontend (consistent with ApplicationController result)
        List<Map<String, Object>> result = apps.stream().map(app -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", app.getId());
            map.put("studentName", app.getFullName() != null ? app.getFullName() : (app.getSeeker() != null ? app.getSeeker().getName() : "Candidate"));
            map.put("role", app.getJobPosting() != null ? app.getJobPosting().getTitle() : "N/A");
            map.put("company", app.getJobPosting() != null ? app.getJobPosting().getCompany() : "N/A");
            map.put("score", app.getScore());
            map.put("status", app.getStatus());
            map.put("fileUrl", app.getResume() != null ? "/uploads/" + app.getResume().getFileName() : "");
            map.put("email", app.getEmail());
            map.put("education", app.getEducation());
            map.put("skills", app.getSkills());
            map.put("matchedSkills", app.getMatchedSkills());
            map.put("missingSkills", app.getMissingSkills());
            return map;
        }).collect(Collectors.toList());

        System.out.println("<<< RESPONSE: 200 - Returning result set of size " + result.size());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats/{recruiterId}")
    public ResponseEntity<?> getRecruiterStats(@PathVariable Long recruiterId) {
        List<JobPosting> jobs = jobPostingRepository.findByPostedById(recruiterId);
        List<Long> jobIds = jobs.stream().map(JobPosting::getId).collect(Collectors.toList());
        List<Application> apps = applicationRepository.findByJobPostingIdIn(jobIds);

        Map<String, Object> stats = Map.of(
            "activeJobs", jobs.size(),
            "totalApps", apps.size(),
            "shortlisted", apps.stream().filter(a -> "SHORTLISTED".equals(a.getStatus().name())).count(),
            "rejected", apps.stream().filter(a -> "REJECTED".equals(a.getStatus().name())).count()
        );

        return ResponseEntity.ok(stats);
    }
}
