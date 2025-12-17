package com.ffive.pos_system.repository;

import com.ffive.pos_system.model.Order;
import com.ffive.pos_system.model.SplitCheck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface SplitCheckRepository extends JpaRepository<SplitCheck, UUID> {
    @Query("""
            SELECT sc FROM SplitCheck sc
            WHERE sc.order.id = :orderId
            """)
    List<SplitCheck> findByOrderId(@Param("orderId") UUID orderId);

    @Query("""
            SELECT sc FROM SplitCheck sc
            WHERE sc.order = :order
            """)
    List<SplitCheck> findByOrder(@Param("order") Order order);
}

