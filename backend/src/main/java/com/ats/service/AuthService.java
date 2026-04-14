package com.ats.service;

import com.ats.dto.*;
import com.ats.model.User;
import com.ats.model.enums.UserRole;
import com.ats.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final com.ats.repository.RecruiterProfileRepository recruiterProfileRepository;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role. Must be JOBSEEKER, ADMIN or RECRUITER");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword()) // Storing plain text for simplicity per user requirements
                .role(role)
                .build();

        userRepository.save(user);

        return AuthResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        
        if (!user.getPassword().equals(request.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // Admin Access Code Validation
        if (user.getRole() == UserRole.ADMIN) {
            String adminCode = "Nikitha@4244";
            if (request.getAccessCode() == null || !request.getAccessCode().equals(adminCode)) {
                throw new IllegalArgumentException("Invalid Admin Access Code");
            }
        }

        // Set activity status
        user.setStatus("ACTIVE");
        userRepository.save(user);

        boolean profileCompleted = true;
        if (user.getRole() == UserRole.RECRUITER) {
            profileCompleted = recruiterProfileRepository.findByRecruiterId(user.getId()).isPresent();
        }

        return AuthResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .profileCompleted(profileCompleted)
                .build();
    }

    public void logout(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setStatus("INACTIVE");
            userRepository.save(user);
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public com.ats.model.RecruiterProfile updateProfile(Long userId, java.util.Map<String, String> profileData) {
        System.out.println(">>> SERVICE: Updating recruiter profile for user: " + userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User with ID " + userId + " not found"));
        
        if (user.getRole() != UserRole.RECRUITER) {
            throw new IllegalArgumentException("Only recruiters can have profiles");
        }

        com.ats.model.RecruiterProfile profile = recruiterProfileRepository.findByRecruiterId(userId)
                .orElse(new com.ats.model.RecruiterProfile());
        
        profile.setRecruiter(user);
        profile.setCompanyName(profileData.get("companyName"));
        profile.setDesignation(profileData.get("designation"));
        profile.setCompanyDescription(profileData.get("companyDescription"));
        profile.setLocation(profileData.get("location"));
        
        com.ats.model.RecruiterProfile saved = recruiterProfileRepository.save(profile);
        System.out.println("<<< SERVICE: Profile saved for recruiter " + user.getEmail());
        return saved;
    }
}
