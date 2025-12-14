package com.ffive.pos_system.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.UUID;

@Getter
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class PaymentException extends RuntimeException {

    private final UUID orderId;
    private final UUID paymentId;

    public PaymentException(String message, UUID orderId, UUID paymentId) {
        super(message);
        this.orderId = orderId;
        this.paymentId = paymentId;
    }

}
