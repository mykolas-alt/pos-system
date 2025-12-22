package com.ffive.pos_system.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ffive.pos_system.model.OrderTax;

public interface OrderTaxRepository extends JpaRepository<OrderTax, UUID> {
}
