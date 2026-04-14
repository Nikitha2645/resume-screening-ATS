package com.ats.controller;

import com.ats.model.enums.ApplicationStatus;
import com.ats.model.enums.UserRole;
import com.ats.repository.ApplicationRepository;
import com.ats.repository.JobPostingRepository;
import com.ats.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    private final UserRepository userRepository;
    private final JobPostingRepository jobPostingRepository;
    private final ApplicationRepository applicationRepository;
    private final com.ats.repository.RecruiterProfileRepository recruiterProfileRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        System.out.println(">>> REQUEST: GET /api/admin/stats");
        
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus("ACTIVE");
        long recruiters = userRepository.countByRole(UserRole.RECRUITER);
        long jobPosts = jobPostingRepository.count();
        long applications = applicationRepository.count();
        long shortlisted = applicationRepository.countByStatus(ApplicationStatus.SHORTLISTED);
        long rejected = applicationRepository.countByStatus(ApplicationStatus.REJECTED);

        Map<String, Object> stats = Map.of(
            "totalUsers", totalUsers,
            "activeUsers", activeUsers,
            "recruiters", recruiters,
            "jobPosts", jobPosts,
            "applications", applications,
            "shortlisted", shortlisted,
            "rejected", rejected
        );

        System.out.println("<<< RESPONSE: 200 - Admin Stats: " + stats);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/generate-jobs")
    public ResponseEntity<?> generateJobs(@RequestParam Long recruiterId) {
        System.out.println(">>> REQUEST: POST /api/admin/generate-jobs for recruiter: " + recruiterId);
        
        com.ats.model.User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));

        String[] titles = {
            "Software Engineer", "Frontend Developer", "Backend Developer", "Fullstack Engineer",
            "DevOps Engineer", "Data Scientist", "Product Manager", "UI/UX Designer",
            "QA Engineer", "Mobile Developer", "Cloud Architect", "Security Specialist",
            "AI Engineer", "Machine Learning Engineer", "Business Analyst", "Marketing Specialist",
            "Sales Executive", "HR Manager", "System Administrator", "Database Administrator"
        };
        
        String[] locations = {"New York, NY", "San Francisco, CA", "Austin, TX", "London, UK", "Remote", "Berlin, DE", "Toronto, CA", "Seattle, WA"};
        String[] companies = {"TechNova Solutions", "Global Systems", "Future Soft", "Innovate AI", "CloudNet Services"};

        java.util.Random random = new java.util.Random();
        int count = 15 + random.nextInt(6); // 15 to 20

        for (int i = 0; i < count; i++) {
            String title = titles[random.nextInt(titles.length)];
            com.ats.model.JobPosting job = com.ats.model.JobPosting.builder()
                    .title(title + " " + (i + 1))
                    .description("Exciting opportunity for a " + title + " to join our growing team. Need hands-on experience and passion.")
                    .requiredSkills("java, spring, react, sql")
                    .location(locations[random.nextInt(locations.length)])
                    .postedBy(recruiter)
                    .company(companies[random.nextInt(companies.length)])
                    .applicationDeadline(java.time.LocalDate.now().plusDays(20 + random.nextInt(30)))
                    .build();
            
            jobPostingRepository.save(job);
        }

        return ResponseEntity.ok(Map.of("message", count + " jobs generated successfully for recruiter ID: " + recruiterId));
    }

    @PostMapping("/reset-data")
    public ResponseEntity<?> resetData() {
        System.out.println(">>> REQUEST: POST /api/admin/reset-data");
        applicationRepository.deleteAll();
        jobPostingRepository.deleteAll();
        // We keep users but could reset their status
        List<com.ats.model.User> users = userRepository.findAll();
        for (com.ats.model.User u : users) {
            u.setStatus("INACTIVE");
        }
        userRepository.saveAll(users);
        
        System.out.println("<<< RESPONSE: 200 - Data reset complete");
        return ResponseEntity.ok(Map.of("message", "System reset successfully. All jobs and applications cleared."));
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/recruiters")
    public ResponseEntity<?> getAllRecruiters() {
        List<com.ats.model.User> recruiters = userRepository.findByRole(UserRole.RECRUITER);
        return ResponseEntity.ok(recruiters.stream().map(u -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("status", u.getStatus());
            
            recruiterProfileRepository.findByRecruiterId(u.getId()).ifPresent(p -> {
                map.put("company", p.getCompanyName());
                map.put("location", p.getLocation());
                map.put("designation", p.getDesignation());
            });
            
            return map;
        }).collect(java.util.stream.Collectors.toList()));
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getAllApplications() {
        return ResponseEntity.ok(applicationRepository.findAll());
    }
}
