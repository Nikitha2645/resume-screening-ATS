package com.ats.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RankingService {

    /**
     * Calculate a match score between resume skills and job required skills.
     * Score is a percentage (0-100) based on how many required skills are matched.
     *
     * @param resumeSkills   comma-separated skills from the resume
     * @param requiredSkills comma-separated required skills from the job posting
     * @return match score from 0.0 to 100.0
     */
    public double calculateScore(String resumeSkills, String requiredSkills) {
        if (resumeSkills == null || resumeSkills.isBlank()
                || requiredSkills == null || requiredSkills.isBlank()) {
            return 0.0;
        }

        Set<String> resumeSkillSet = parseSkills(resumeSkills);
        Set<String> requiredSkillSet = parseSkills(requiredSkills);

        if (requiredSkillSet.isEmpty()) {
            return 0.0;
        }

        long matchCount = requiredSkillSet.stream()
                .filter(skill -> resumeSkillSet.stream().anyMatch(rs -> rs.contains(skill) || skill.contains(rs)))
                .count();

        return Math.round((double) matchCount / requiredSkillSet.size() * 100.0 * 10.0) / 10.0;
    }

    private Set<String> parseSkills(String skills) {
        return Arrays.stream(skills.toLowerCase().split("[,;|\\n]"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());
    }
}
