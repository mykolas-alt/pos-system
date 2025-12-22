package com.ffive.pos_system.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ffive.pos_system.model.OrderTax;
import com.ffive.pos_system.model.Tax;

public interface OrderTaxRepository extends JpaRepository<OrderTax, UUID> {
    @Modifying
    @Query("DELETE FROM OrderTax ot WHERE ot.tax = :tax AND ot.order.status = 1")
    void deleteAllByTaxIfOrderOpen(@Param("tax") Tax tax);
}
