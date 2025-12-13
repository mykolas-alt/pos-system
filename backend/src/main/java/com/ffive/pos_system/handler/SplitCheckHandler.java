package com.ffive.pos_system.handler;

import java.math.BigDecimal;
import org.springframework.stereotype.Component;
import com.ffive.pos_system.model.Order;
import com.ffive.pos_system.model.OrderStatus;

@Component
public class SplitCheckHandler {

    public void handleSplitPayment(Order order, BigDecimal currentPaymentAmount) {
        BigDecimal previouslyPaid = order.getPaidAmount() != null ? order.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal newTotalPaid = previouslyPaid.add(currentPaymentAmount);

        // updating how much money has been paid already
        order.setPaidAmount(newTotalPaid);

        // checking if fully paid
        // compareTo (0 is equal, 1 is greater)
        if (newTotalPaid.compareTo(order.getTotal()) >= 0) {
            order.setStatus(OrderStatus.PAID);
        } else {
            order.setStatus(OrderStatus.PARTIALLY_PAID);
        }
    }
}