package com.ffive.pos_system.model;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "orderitemdiscount")
public class OrderItemDiscount {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "orderitem_id", nullable = false)
    private OrderItem orderItem;

    @ManyToOne
    @JoinColumn(name = "discount_id", nullable = false)
    private Discount discount;

    @Column(name = "name_snapshot")
    private String nameSnapshot;

    @Column(name = "name_snapshot")
    private BigDecimal rateSnapshot;
}
