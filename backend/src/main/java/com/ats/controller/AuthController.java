package com.ats.controller;

import com.ats.dto.*;
import com.ats.service.AuthService;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    @GetMapping("/auth/test")
    public String test() { return "Auth Controller is LIVE"; }

    @PostMapping({"/auth/signup", "/auth/register"})
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<?> logout(@RequestParam Long userId) {
        authService.logout(userId);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/auth/update-profile")
    public ResponseEntity<?> updateProfile(@RequestParam Long userId, @RequestBody Map<String, String> profile) {
        try {
            System.out.println(">>> REQUEST: POST /auth/update-profile for user: " + userId);
            com.ats.model.RecruiterProfile updatedProfile = authService.updateProfile(userId, profile);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Profile updated",
                "id", updatedProfile.getId(),
                "companyName", updatedProfile.getCompanyName()
            ));
        } catch (Exception e) {
            System.err.println("!!! ERROR in updateProfile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error: " + e.getMessage()));
        }
    }
}
