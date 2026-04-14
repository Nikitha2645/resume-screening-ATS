package com.ats.controller;

import com.ats.service.ApplicationService;
import com.ats.model.Application;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ApplicationController {
    
    private final ApplicationService applicationService;
    private final com.ats.repository.ApplicationRepository applicationRepository; 
    private final com.ats.repository.UserRepository userRepository;
    private final com.ats.repository.JobPostingRepository jobPostingRepository;
    private final com.ats.repository.NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<?> getAllApplications() {
        System.out.println(">>> REQUEST: GET /api/applications");
        List<Application> apps = applicationService.getAllApplications();
        
        List<Map<String, Object>> result = apps.stream().map(app -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", app.getId());
            map.put("studentName", app.getFullName() != null ? app.getFullName() : (app.getSeeker() != null ? app.getSeeker().getName() : "Candidate"));
            map.put("role", app.getJobPosting() != null ? app.getJobPosting().getTitle() : "N/A");
            map.put("company", app.getJobPosting() != null ? app.getJobPosting().getCompany() : "N/A");
            map.put("score", app.getScore());
            map.put("status", app.getStatus());
            map.put("fileUrl", (app.getResume() != null) ? ("/uploads/" + app.getResume().getFileName()) : (app.getResumeUrl() != null ? app.getResumeUrl() : ""));
            map.put("email", app.getEmail());
            map.put("education", app.getEducation());
            map.put("skills", app.getSkills());
            map.put("seekerId", app.getSeeker().getId());
            return map;
        }).collect(Collectors.toList());

        System.out.println("<<< RESPONSE: 200 - Fetched " + result.size() + " applications");
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String statusStr = request.get("status");
        System.out.println(">>> REQUEST: PUT /api/applications/" + id + "/status -> " + statusStr);

        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        com.ats.model.enums.ApplicationStatus newStatus = com.ats.model.enums.ApplicationStatus.valueOf(statusStr);
        application.setStatus(newStatus);
        applicationRepository.save(application);

        // Create Notification
        String msg = "Your application for '" + application.getJobPosting().getTitle() + "' has been " + statusStr.toLowerCase() + ".";
        com.ats.model.Notification notification = com.ats.model.Notification.builder()
                .user(application.getSeeker())
                .message(msg)
                .build();
        notificationRepository.save(notification);

        return ResponseEntity.ok(Map.of("success", true, "message", "Status updated and candidate notified"));
    }

    @PostMapping
    public ResponseEntity<?> applyReal(@RequestBody Map<String, Object> data) {
        return apply(data);
    }

    @PostMapping("/apply")
    public ResponseEntity<?> apply(@RequestBody Map<String, Object> data) {
        System.out.println(">>> REQUEST: POST /api/applications/apply - Data: " + data);
        
        try {
            Long userId = Long.valueOf(data.get("userId").toString());
            Long jobId = Long.valueOf(data.get("jobId").toString());
            String resumeUrl = (String) data.get("resumeUrl");

            // Prevent duplicate apply
            if (applicationRepository.existsBySeekerIdAndJobPostingId(userId, jobId)) {
                return ResponseEntity.status(409).body(Map.of("success", false, "message", "You have already applied for this job."));
            }
            
            com.ats.model.User seeker = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));
            
            com.ats.model.JobPosting job = jobPostingRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found: " + jobId));

            Double score = 0.0;
            if (data.get("score") != null) {
                score = Double.valueOf(data.get("score").toString());
            }

            com.ats.model.Application application = com.ats.model.Application.builder()
                    .seeker(seeker)
                    .jobPosting(job)
                    .fullName(seeker.getName())
                    .email(seeker.getEmail())
                    .resumeUrl(resumeUrl)
                    .score(score)
                    .status(com.ats.model.enums.ApplicationStatus.APPLIED)
                    .build();
            
            applicationRepository.save(application);
            
            // Notification for Recruiter (optional but good)
            System.out.println("<<< RESPONSE: 200 - Application created for user " + userId + " on job " + jobId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Application submitted successfully"));
        } catch (Exception e) {
            System.out.println("<<< RESPONSE: 400 - Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
