package com.ffive.pos_system.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ffive.pos_system.model.Payment;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    @Query("""
            SELECT p FROM Payment p
            WHERE p.orderId = :orderId
            """)
    List<Payment> findByOrderId(@Param("orderId") UUID orderId);
}