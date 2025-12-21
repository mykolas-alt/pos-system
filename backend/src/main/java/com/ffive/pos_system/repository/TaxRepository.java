package com.ffive.pos_system.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.Tax;

public interface TaxRepository extends JpaRepository<Tax, UUID> {
    Page<Tax> findAllByBusiness(Business business, Pageable pageable);
}
