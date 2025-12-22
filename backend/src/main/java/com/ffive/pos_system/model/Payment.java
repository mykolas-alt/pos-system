package com.ffive.pos_system.model;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = true)
    private UUID orderId;

    @Column(nullable = true)
    private UUID reservationId;

    @Column(nullable = false)
    private PaymentType paymentType;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column
    private BigDecimal tip;

    @Column(nullable = false)
    private UUID transactionId;
}
