package com.ats.controller;

import com.ats.model.JobPosting;
import com.ats.service.JobPostingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class JobPostingController {

    private final JobPostingService jobPostingService;

    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody JobPosting jobPosting, @RequestParam(value = "recruiterId", required = false) Long recruiterId) {
        System.out.println(">>> REQUEST: POST /jobs by recruiter: " + recruiterId);
        try {
            JobPosting savedJob = jobPostingService.createJob(jobPosting, recruiterId);
            System.out.println("<<< RESPONSE: 201 - Job created: " + savedJob.getTitle());
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Job created successfully",
                "data", savedJob
            ));
        } catch (Exception e) {
            System.out.println("<<< RESPONSE: 400 - Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @GetMapping
    public List<JobPosting> getAllJobs() {
        System.out.println(">>> REQUEST: GET /jobs");
        List<JobPosting> jobs = jobPostingService.getAllJobs();
        System.out.println("<<< RESPONSE: 200 - Fetched " + jobs.size() + " jobs");
        return jobs;
    }

    @GetMapping("/recruiter/{recruiterId}")
    public ResponseEntity<List<JobPosting>> getJobsByRecruiter(@PathVariable Long recruiterId) {
        System.out.println(">>> REQUEST: GET /jobs/recruiter/" + recruiterId);
        List<JobPosting> jobs = jobPostingService.getJobsByRecruiter(recruiterId);
        return ResponseEntity.ok(jobs);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        System.out.println(">>> REQUEST: DELETE /jobs/" + id);
        try {
            jobPostingService.deleteJobById(id);
            System.out.println("<<< RESPONSE: 200 - Job deleted");
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Job deleted successfully"
            ));
        } catch (Exception e) {
            System.out.println("<<< RESPONSE: 400 - Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}
