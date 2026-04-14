package com.ats.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AtsService {

    private static final List<String> KNOWN_SKILLS = Arrays.asList(
            "Java", "Python", "C++", "C#", "JavaScript", "React", "Angular", "Vue", "Node.js", 
            "Express", "Spring Boot", "Spring", "Hibernate", "SQL", "MySQL", "PostgreSQL", 
            "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", 
            "Jenkins", "CI/CD", "HTML", "CSS", "TailwindCSS", "Bootstrap", "TypeScript", 
            "PHP", "Laravel", "Django", "Flask", "Machine Learning", "Data Science", "AI",
            "Project Management", "Agile", "Scrum", "Communication", "Leadership", "Teamwork"
    );

    public String extractTextFromPdf(MultipartFile file) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            System.out.println("---- EXTRACTED RESUME TEXT ----");
            System.out.println(text.substring(0, Math.min(text.length(), 500)) + "...");
            System.out.println("-------------------------------");
            return text;
        }
    }

    public List<String> extractSkills(String text) {
        if (text == null || text.isEmpty()) return Collections.emptyList();
        
        String lowercaseText = text.toLowerCase();
        List<String> skills = KNOWN_SKILLS.stream()
                .filter(skill -> {
                    String skillLower = skill.toLowerCase();
                    // Basic keyword matching with word boundaries if possible
                    return lowercaseText.contains(skillLower);
                })
                .collect(Collectors.toList());
        
        System.out.println("Extracted Resume Skills: " + skills);
        return skills;
    }

    public Map<String, Object> calculateScore(String resumeText, String requiredSkillsStr) {
        if (resumeText == null || requiredSkillsStr == null || requiredSkillsStr.isEmpty()) {
            return Map.of(
                    "score", 0,
                    "matchedSkills", Collections.emptyList(),
                    "missingSkills", Collections.emptyList()
            );
        }

        String lowercaseResume = resumeText.toLowerCase();
        
        // Expand role names into comprehensive skill sets
        String skillPool = requiredSkillsStr;
        String roleCategory = "General";
        if (!requiredSkillsStr.contains(",")) {
            String role = requiredSkillsStr.toLowerCase();
            if (role.contains("embedded") || role.contains("firmware")) {
                skillPool = "C, C++, RTOS, Microcontrollers, UART, SPI, I2C, Embedded Systems, Firmware, ARM, Assembly, Debugging, FreeRTOS, Bare Metal";
                roleCategory = "Embedded Systems";
            } else if (role.contains("vlsi") || role.contains("fpga") || role.contains("soc") || role.contains("asic")) {
                skillPool = "Verilog, VHDL, FPGA, ASIC, CMOS, Synthesis, Verification, Cadence, RTL Design, SoC, Digital Systems, SystemVerilog, UVM, Timing Analysis";
                roleCategory = "VLSI & Hardware Design";
            } else if (role.contains("software engineer") || role.contains("backend") || role.contains("full stack") || role.contains("technical lead") || role.contains("cto")) {
                skillPool = "Java, Spring Boot, DSA, System Design, SQL, Docker, Git, Rest API, Microservices, Python, Node.js, AWS, Kubernetes, Scalability, Architecture";
                roleCategory = "Software Engineering";
            } else if (role.contains("data scientist") || role.contains("machine learning") || role.contains("ai")) {
                skillPool = "Python, R, Machine Learning, Statistics, Pandas, SQL, Scikit-learn, Deep Learning, TensorFlow, PyTorch, Big Data, Neural Networks";
                roleCategory = "Data Science & AI";
            } else if (role.contains("devops") || role.contains("cloud") || role.contains("sre")) {
                skillPool = "Kubernetes, Docker, AWS, Azure, GCP, Jenkins, CI/CD, Terraform, Linux, Shell Scripting, Monitoring, Ansible, Prometheus";
                roleCategory = "DevOps & Cloud";
            } else if (role.contains("frontend") || role.contains("ui/ux") || role.contains("designer")) {
                skillPool = "React, HTML, CSS, JavaScript, TypeScript, Tailwind, Redux, Next.js, Figma, Adobe XD, Responsive Design, CSS Flexbox, Web Accessibility";
                roleCategory = "Frontend & UI/UX";
            } else if (role.contains("security") || role.contains("cybersecurity") || role.contains("tester")) {
                skillPool = "Networking, Linux, Penetration Testing, OWASP, Firewall, Encryption, IAM, Security Audit, Wireshark, Metasploit, SIEM";
                roleCategory = "Cybersecurity";
            } else if (role.contains("manager") || role.contains("lead") || role.contains("scrum")) {
                skillPool = "Leadership, Jira, Agile, Scrum, Project Planning, Stakeholder Management, Budgets, Risk Management, Team Mentoring, Delivery Tracking";
                roleCategory = "Management & Leadership";
            } else if (role.contains("data enginee") || role.contains("big data") || role.contains("bi")) {
                skillPool = "SQL, ETL, Hadoop, Spark, Kafka, Data Warehousing, Airflow, Tableau, PowerBI, Presto, Hive";
                roleCategory = "Data Engineering";
            }
        }

        List<String> jobSkills = Arrays.stream(skillPool.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String skill : jobSkills) {
            // Precise word boundary check for better accuracy
            String pattern = "\\b" + java.util.regex.Pattern.quote(skill.toLowerCase()) + "\\b";
            if (java.util.regex.Pattern.compile(pattern).matcher(lowercaseResume).find() || lowercaseResume.contains(skill.toLowerCase())) {
                matchedSkills.add(skill);
            } else {
                missingSkills.add(skill);
            }
        }

        double rawScore = ((double) matchedSkills.size() / jobSkills.size()) * 100;
        int score = (int) Math.round(rawScore);

        // Generate detailed improvements
        List<String> recommendations = new ArrayList<>();
        StringBuilder improvementPlan = new StringBuilder();

        if (score >= 90) {
            recommendations.add("Excellent Match! Your profile is highly compatible with " + roleCategory + " standards.");
            improvementPlan.append("Your resume shows a strong mastery of the core competencies required for a " + requiredSkillsStr + ". ");
            improvementPlan.append("To elevate your application further, focus on showcasing your impact through metrics and leadership examples. ");
            improvementPlan.append("Consider adding specific certifications if you haven't already.");
        } else if (score >= 70) {
            recommendations.add("Strong Profile, but needs fine-tuning.");
            improvementPlan.append("You have a solid foundation for a " + requiredSkillsStr + " role, but there are a few key technical gaps. ");
            improvementPlan.append("The primary areas for improvement are: " + String.join(", ", missingSkills) + ". ");
            improvementPlan.append("Recruiters in this field look for hands-on experience with these tools. We recommend updating your 'Projects' or 'Experience' section to explicitly mention how you've interacted with these technologies.");
        } else {
            recommendations.add("Improvement Required: Low match for " + roleCategory + ".");
            improvementPlan.append("Your current resume is missing several critical keywords and skills that are essential for a " + requiredSkillsStr + " position. ");
            improvementPlan.append("To improve your chances, you should focus on learning and documenting the following core technologies: " + String.join(", ", missingSkills) + ". ");
            improvementPlan.append("A good strategy would be to take specialized courses or build a small portfolio project that specifically uses these missing tools. This will provide the 'proof of work' that ATS systems and recruiters are looking for.");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("score", score);
        result.put("matchedSkills", matchedSkills);
        result.put("missingSkills", missingSkills);
        result.put("recommendations", recommendations);
        result.put("improvementPlan", improvementPlan.toString());
        result.put("success", true);
        
        return result;
    }
}
