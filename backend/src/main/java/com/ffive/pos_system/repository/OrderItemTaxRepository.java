package com.ffive.pos_system.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ffive.pos_system.model.OrderItemTax;
import com.ffive.pos_system.model.Tax;

public interface OrderItemTaxRepository extends JpaRepository<OrderItemTax, UUID> {
    @Modifying
    @Query("DELETE FROM OrderItemTax oit WHERE oit.tax = :tax AND oit.orderItem.order.status = 1")
    void deleteAllByTaxIfOrderOpen(@Param("tax") Tax tax);
}
