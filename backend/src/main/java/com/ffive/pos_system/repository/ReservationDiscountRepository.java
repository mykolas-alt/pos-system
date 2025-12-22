package com.ffive.pos_system.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ffive.pos_system.model.ReservationDiscount;

public interface ReservationDiscountRepository extends JpaRepository<ReservationDiscount, UUID> {
}