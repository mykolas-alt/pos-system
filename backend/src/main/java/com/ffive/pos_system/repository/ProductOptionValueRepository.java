package com.ffive.pos_system.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ffive.pos_system.model.ProductOptionGroup;
import com.ffive.pos_system.model.ProductOptionValue;

public interface ProductOptionValueRepository extends JpaRepository<ProductOptionValue, UUID> {
    Page<ProductOptionValue> findAllByOptionGroup(ProductOptionGroup optionGroup, Pageable pageable);
}
