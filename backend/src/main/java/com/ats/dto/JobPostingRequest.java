package com.ats.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JobPostingRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String requiredSkills;
    private String location;
    private String salaryRange;
}
