package com.ffive.pos_system.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ffive.pos_system.model.OrderDiscount;

public interface OrderDiscountRepository extends JpaRepository<OrderDiscount, UUID> {
}
