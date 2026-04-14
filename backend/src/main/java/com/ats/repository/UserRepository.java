package com.ats.repository;

import com.ats.model.User;
import com.ats.model.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    long countByRole(UserRole role);
    long countByStatus(String status);
    List<User> findByRole(UserRole role);
}
