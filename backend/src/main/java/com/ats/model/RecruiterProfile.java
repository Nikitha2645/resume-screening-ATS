package com.ats.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recruiter_profiles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class RecruiterProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User recruiter;

    @Column(nullable = false)
    private String companyName;

    private String designation;
    
    private String location;

    @Column(columnDefinition = "TEXT")
    private String companyDescription;
}
