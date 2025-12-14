package com.ffive.pos_system.repository;

import com.ffive.pos_system.model.SplitCheck;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SplitCheckRepository extends JpaRepository<SplitCheck, UUID> {
    List<SplitCheck> findByOrderId(UUID orderId);
}

