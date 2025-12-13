package com.ffive.pos_system.service;

import com.ffive.pos_system.dto.PaymentRequest;
import com.ffive.pos_system.handler.SplitCheckHandler;
import com.ffive.pos_system.model.Order;
import com.ffive.pos_system.model.Payment;
import com.ffive.pos_system.model.PaymentType;
import com.ffive.pos_system.repository.OrderRepository;
import com.ffive.pos_system.repository.PaymentRepository;


import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final StripeService stripeService;
    private final SplitCheckHandler splitCheckHandler;
    private final OrderRepository orderRepository;

    @Transactional
    public Payment processPayment(PaymentRequest request) {

        // 1. fetching the order from the repository
        Order order = orderRepository.findById(request.getOrderId())
                 .orElseThrow(() -> new RuntimeException("Order not found"));

        // 2. processing stripe payment
        String transactionId = null;
        if (request.getPaymentType() == PaymentType.CARD) {
            try {
                // using stripe api
                transactionId = stripeService.chargeCard(request.getStripeToken(), request.getAmount());
            } catch (Exception e) {
                throw new RuntimeException("Card payment failed: " + e.getMessage());
            }
        }

        // 3. saving payment
        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .paymentType(request.getPaymentType())
                .amount(request.getAmount())
                .id(UUID.fromString(transactionId))
                .build();

        paymentRepository.save(payment);

        // 4. handling split billing
        splitCheckHandler.handleSplitPayment(order, request.getAmount());

        orderRepository.save(order);

        return payment;
    }
}