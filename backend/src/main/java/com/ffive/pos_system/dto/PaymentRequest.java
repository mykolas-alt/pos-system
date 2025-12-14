package com.ffive.pos_system.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.ffive.pos_system.model.PaymentType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;

@Data
public class PaymentRequest {

    @Id
    @GeneratedValue
    private UUID orderId;
    private PaymentType paymentType;
    private BigDecimal amount;
    private BigDecimal tip;

    private String stripeToken;
    private String giftCardCode;

    private UUID splitCheckId; // if a payment is with an associated split check, the split check ID is registered here

}

