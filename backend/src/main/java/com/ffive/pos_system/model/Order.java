package com.ffive.pos_system.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Order {

    @Id
    @GeneratedValue
    @Schema(hidden = true)
    private UUID id;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    private OrderStatus status;

    private String note;

    @ManyToOne
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    // snapshot fields
    private BigDecimal total;
    private BigDecimal tip;

    @Column(name = "service_charge")
    private BigDecimal serviceCharge;
}
