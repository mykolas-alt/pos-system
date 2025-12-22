package com.ffive.pos_system.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ffive.pos_system.model.Discount;
import com.ffive.pos_system.model.OrderDiscount;

public interface OrderDiscountRepository extends JpaRepository<OrderDiscount, UUID> {
    @Modifying
    @Query("DELETE FROM OrderDiscount od WHERE od.discount = :discount AND od.order.status = 1")
    void deleteAllByDiscountIfOrderOpen(@Param("discount") Discount discount);
}
