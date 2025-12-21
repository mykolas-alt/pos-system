package com.ffive.pos_system.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.Order;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByBusinessId(UUID id);

    Page<Order> findAllByBusiness(Business business, Pageable pageable);
}
