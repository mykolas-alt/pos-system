package com.ffive.pos_system.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ffive.pos_system.model.ProductOptionGroup;

public interface ProductOptionGroupRepository extends JpaRepository<ProductOptionGroup, UUID> {
    Page<ProductOptionGroup> findAllByProductId(UUID productId, Pageable pageable);
}
