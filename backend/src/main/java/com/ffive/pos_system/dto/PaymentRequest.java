package com.ffive.pos_system.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.ffive.pos_system.model.PaymentType;
import lombok.Data;

@Data
public class PaymentRequest {
    private UUID orderId;
    private PaymentType paymentType;
    private BigDecimal amount;

    private String stripeToken;
    private boolean isSplit; // maybe will need it
}

