package com.ffive.pos_system.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.ffive.pos_system.model.UserRole;
import com.ffive.pos_system.model.UserRoleType;

public interface UserRoleRepository extends JpaRepository<UserRole, Byte> {

    @Query("""
            SELECT r FROM UserRole r
            WHERE r.roleType = :roleType
            """)
    Optional<UserRole> findByRoleType(UserRoleType roleType);
}
