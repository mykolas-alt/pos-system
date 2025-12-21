package com.ffive.pos_system.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.ffive.pos_system.dto.OrderSplitRequest;
import com.ffive.pos_system.dto.PaymentRequest;
import com.ffive.pos_system.model.Payment;
import com.ffive.pos_system.service.PaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payment")
@Tag(name = "Payment", description = "Endpoints for processing payments and refunds")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Payment> processPayment(@RequestBody PaymentRequest paymentRequest) {
        Payment processedPayment = paymentService.processPayment(paymentRequest);
        return ResponseEntity.ok(processedPayment);
    }

    @PostMapping("/split")
    public ResponseEntity<Void> splitOrder(@RequestBody OrderSplitRequest splitRequest) {
        paymentService.splitOrder(splitRequest);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refund/{orderId}")
    public ResponseEntity<Void> refundOrder(UUID orderId) {
        paymentService.refundOrder(orderId);
        return ResponseEntity.ok().build();
    }

}
