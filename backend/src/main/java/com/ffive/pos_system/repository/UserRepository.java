package com.ffive.pos_system.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.ffive.pos_system.model.POSUser;

public interface UserRepository extends JpaRepository<POSUser, UUID> {

    @Query("""
            SELECT u FROM POSUser u
            WHERE u.username = :username
            """)
    Optional<POSUser> findByUsername(String username);
}
