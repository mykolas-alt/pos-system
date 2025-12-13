package com.ffive.pos_system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.ffive.pos_system.dto.PaymentRequest;
import com.ffive.pos_system.model.Payment;
import com.ffive.pos_system.service.PaymentService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Payment> processPayment(@RequestBody PaymentRequest paymentRequest) {
        Payment processedPayment = paymentService.processPayment(paymentRequest);
        return ResponseEntity.ok(processedPayment);
    }
}