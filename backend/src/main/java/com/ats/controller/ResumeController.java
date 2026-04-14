package com.ats.controller;

import com.ats.service.AtsService;
import com.ats.service.JobPostingService;
import com.ats.model.JobPosting;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.List;
import java.util.HashMap;

@RestController
@RequestMapping("/resume")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ResumeController {

    private final AtsService atsService;
    private final JobPostingService jobPostingService;
    private final com.ats.repository.UserRepository userRepository;
    private final com.ats.repository.ResumeRepository resumeRepository;
    private final com.ats.repository.ApplicationRepository applicationRepository;

    @PostMapping("/upload")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "jobId", required = false) Long jobId,
            @RequestParam("userId") Long userId,
            @RequestParam("fullName") String fullName,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam("education") String education,
            @RequestParam("skills") String skills,
            @RequestParam(value = "targetRole", required = false) String targetRole) {
        
        System.out.println(">>> REQUEST: POST /resume/upload from user: " + userId);
        
        try {
            // Debug logs
            System.out.println("Processing file: " + file.getOriginalFilename());

            // Check empty
            if (file.isEmpty()) {
                System.out.println("<<< RESPONSE: 400 - File is empty");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "File is empty"
                ));
            }

            // Validation
            String contentType = file.getContentType();
            if (contentType == null || !contentType.toLowerCase().contains("pdf")) {
                System.out.println("<<< RESPONSE: 400 - Invalid content type: " + contentType);
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Only PDF files are allowed"
                ));
            }

            // 1. Save File correctly
            String fileName = file.getOriginalFilename();
            Path uploadDir = Paths.get("uploads");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            Path path = uploadDir.resolve(fileName);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            String fileUrl = "/uploads/" + fileName;

            // 2. Extract Text
            String resumeText = atsService.extractTextFromPdf(file);
            
            // 3. (Optional) Extract Skills from Resume - keeping for logs but not scoring
            // List<String> resumeSkills = atsService.extractSkills(resumeText);

            // 4. Get Required Skills from Job OR Role
            String requiredSkillsStr = "";
            if (jobId != null) {
                JobPosting job = jobPostingService.getJobById(jobId);
                if (job != null) {
                    requiredSkillsStr = (job.getSkills() != null && !job.getSkills().isEmpty()) ? job.getSkills() : job.getRequiredSkills();
                    if (requiredSkillsStr == null || requiredSkillsStr.trim().isEmpty()) {
                        requiredSkillsStr = job.getDescription();
                    }
                }
            } else if (targetRole != null && !targetRole.isEmpty()) {
                // Use the role name as the skill source (or a predefined map in real world)
                requiredSkillsStr = targetRole; 
            } else {
                requiredSkillsStr = "Java, Python, SQL, React, Docker";
            }

            // 5. Calculate Score
            Map<String, Object> analysis = atsService.calculateScore(resumeText, requiredSkillsStr);
            double score = Double.parseDouble(analysis.get("score").toString());
            
            // 6. Save Entities to DB
            com.ats.model.User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            com.ats.model.Resume resume = com.ats.model.Resume.builder()
                    .user(user)
                    .fileName(fileName)
                    .filePath(path.toString())
                    .skillsText(resumeText)
                    .build();
            resume = resumeRepository.save(resume);

            JobPosting job = null;
            if (jobId != null) {
                job = jobPostingService.getJobById(jobId);
                if (job == null) {
                    System.out.println("<<< RESPONSE: 404 - Job not found for ID: " + jobId);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "success", false,
                        "message", "Job not found. Please selected a valid job on the left."
                    ));
                }
                if (applicationRepository.existsBySeekerIdAndJobPostingId(userId, jobId)) {
                    System.out.println("<<< RESPONSE: 409 - Application already exists");
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                        "success", false,
                        "message", "You have already applied for this job."
                    ));
                }
            }
            
            if (jobId != null) {
                com.ats.model.Application application = com.ats.model.Application.builder()
                        .seeker(user)
                        .jobPosting(job)
                        .resume(resume)
                        .fullName(fullName)
                        .email(email)
                        .phone(phone)
                        .education(education)
                        .skills(skills)
                        .score(score)
                        .matchedSkills(String.join(", ", (List<String>) analysis.get("matchedSkills")))
                        .missingSkills(String.join(", ", (List<String>) analysis.get("missingSkills")))
                        .status(com.ats.model.enums.ApplicationStatus.APPLIED)
                        .build();
                applicationRepository.save(application);
            }

            // Add file URL to response
            Map<String, Object> finalResponse = new HashMap<>(analysis);
            finalResponse.put("fileUrl", fileUrl);
            finalResponse.put("success", true);
            finalResponse.put("message", "Resume uploaded and application submitted successfully");

            System.out.println("<<< RESPONSE: 200 - Upload & Application Success");
            return ResponseEntity.ok(finalResponse);

        } catch (Exception e) {
            System.out.println("<<< RESPONSE: 500 - Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "success", false,
                        "message", "Upload and analysis failed: " + e.getMessage()
                    ));
        }
    }
}
