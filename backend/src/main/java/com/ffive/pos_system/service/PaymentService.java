package com.ffive.pos_system.service;

import com.ffive.pos_system.dto.OrderSplitRequest;
import com.ffive.pos_system.dto.PaymentRequest;
import com.ffive.pos_system.exceptions.PaymentException;
import com.ffive.pos_system.handler.SplitCheckHandler;
import com.ffive.pos_system.model.Order;
import com.ffive.pos_system.model.OrderStatus;
import com.ffive.pos_system.model.Payment;
import com.ffive.pos_system.model.PaymentType;
import com.ffive.pos_system.repository.OrderRepository;
import com.ffive.pos_system.repository.PaymentRepository;


import com.ffive.pos_system.service.validation.ValidationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
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

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Payment amount must be positive.");
        }

        // 1. fetching the order from the repository
        Order order = orderRepository.findById(request.getOrderId())
                 .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() == OrderStatus.PAID) {
            throw new ValidationException("Order is already fully paid");
        }

        BigDecimal newPaidAmount = order.getPaidAmount().add(request.getAmount());
        if (newPaidAmount.compareTo(order.getTotal()) > 0) {
            throw new ValidationException("Payment amount exceeds remaining balance");
        }

        // 2. processing stripe payment
        String transactionId = UUID.randomUUID().toString(); // transaction ID must also be present for cash/gift-card payments
        PaymentType paymentType = request.getPaymentType();

        BigDecimal totalToCharge = request.getAmount();
        if (request.getTip() != null) {
            totalToCharge = totalToCharge.add(request.getTip());
        }

        if (request.getServiceCharge() != null) {
            totalToCharge = totalToCharge.add(request.getServiceCharge());
        }


        if (paymentType == PaymentType.CARD) {

            if (request.getStripeToken() == null || request.getStripeToken().isEmpty()) {
                throw new ValidationException("Stripe token required for CARD payment");
            }

            try {
                // using stripe api
                // adding tip as well

                transactionId = stripeService.chargeCard(request.getStripeToken(), totalToCharge);
            } catch (Exception e) {
                throw new ValidationException("Card payment failed: " + e.getMessage());
            }
        } else if (paymentType == PaymentType.GIFT_CARD) {
            if (request.getGiftCardCode() == null || request.getGiftCardCode().isEmpty()) {
                throw new ValidationException("Gift card code required.");
            }

            // mocking validation of gift-cards
            if (!isValidGiftCard(request.getGiftCardCode())) {
                throw new ValidationException("Invalid gift card code.");
            }

        } else if (paymentType == PaymentType.CASH) {
            // nothing needs to be done for cash
        }

        // 3. saving payment
        Payment payment = Payment.builder()
                .orderId(request.getOrderId())
                .paymentType(request.getPaymentType())
                .amount(request.getAmount())
                .tip(request.getTip())
                .id(UUID.fromString(transactionId))
                .build();

        paymentRepository.save(payment);

        // 4. handling split billing
        splitCheckHandler.processSplitPayment(request);
        splitCheckHandler.updateOrderStatus(order, request.getAmount());
        orderRepository.save(order);

        return payment;
    }

    public void splitOrder(OrderSplitRequest splitRequest) {
        Order order = orderRepository.findById(splitRequest.getOrderId())
                .orElseThrow(() -> new ValidationException("Order not found"));

        if (order.getStatus() == OrderStatus.PAID) {
            throw new ValidationException("Cannot split an already paid order");
        }

        splitCheckHandler.createSplits(order, splitRequest.getSplitAmounts());

    }

    private boolean isValidGiftCard(String code) {
        // ? we did not agree how this format should look, but I can create whatever
        return code.startsWith("GiftCard-");
    }

    @Transactional
    public void refundOrder(UUID orderID) {
        Order order = orderRepository.findById(orderID)
                .orElseThrow(() -> new ValidationException("Order not found for refund"));

        if (order.getStatus() != OrderStatus.PAID) {
            throw new ValidationException("Only paid orders can be refunded.");
        }

        List<Payment> payments = paymentRepository.findByOrderId(orderID);

        for (Payment payment : payments) {
            if (payment.getPaymentType() == PaymentType.CARD) {
                try {
                    stripeService.refundCharge(payment.getId().toString());
                } catch (Exception e) {
                    throw new ValidationException("Failed to refund through Stripe: " + e.getMessage());
                }
            }
        }

        order.setStatus(OrderStatus.REFUNDED);
        orderRepository.save(order);

    }

}
