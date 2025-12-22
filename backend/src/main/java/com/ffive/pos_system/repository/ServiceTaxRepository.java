package com.ffive.pos_system.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ffive.pos_system.model.ServiceTax;

public interface ServiceTaxRepository extends JpaRepository<ServiceTax, UUID> {
}