package com.ffive.pos_system.handler;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import com.ffive.pos_system.dto.PaymentRequest;
import com.ffive.pos_system.exceptions.PaymentException;
import com.ffive.pos_system.model.SplitCheck;
import com.ffive.pos_system.model.SplitCheckStatus;
import com.ffive.pos_system.repository.SplitCheckRepository;
import org.springframework.stereotype.Component;
import com.ffive.pos_system.model.Order;
import com.ffive.pos_system.model.OrderStatus;

@Component
public class SplitCheckHandler {

    private final SplitCheckRepository splitCheckRepository;

    public SplitCheckHandler(SplitCheckRepository splitCheckRepository) {
        this.splitCheckRepository = splitCheckRepository;
    }

    public void createSplits(Order order, List<BigDecimal> splitAmounts) {
        if (splitAmounts == null || splitAmounts.isEmpty()) {
            return;
        }

        BigDecimal totalSplitAmount = BigDecimal.ZERO;
        for (BigDecimal amount : splitAmounts) {
            totalSplitAmount = totalSplitAmount.add(amount);
        }

        if (totalSplitAmount.compareTo(order.getTotal()) != 0) {
            throw new PaymentException("Total split amount is not the same as total order amount", order.getId(), null);
        }

        int count = 1;
        for (BigDecimal amount : splitAmounts) {
            SplitCheck split = SplitCheck.builder()
                    .order(order)
                    .amount(amount)
                    .name("Split " + ++count)
                    .status(SplitCheckStatus.PENDING)
                    .build();
            splitCheckRepository.save(split);
        }

    }


    //
    public Optional<SplitCheck> processSplitPayment(PaymentRequest request) {
        if (request.getSplitCheckId() == null) {
            return Optional.empty();
        }

        SplitCheck splitCheck = splitCheckRepository.findById(request.getSplitCheckId())
                .orElseThrow(() -> new PaymentException("Split check not found", null, null));

        if (splitCheck.getStatus() == SplitCheckStatus.PAID) {
            throw new PaymentException("This split check is already paid.", request.getOrderId(), splitCheck.getId());
        }

        if (request.getAmount().compareTo(splitCheck.getAmount()) < 0) {
            if (request.getAmount().compareTo(splitCheck.getAmount()) != 0) {
                throw new RuntimeException("Payment amount must match split check amount (" + splitCheck.getAmount() + ")");
            }
        }

        splitCheck.setStatus(SplitCheckStatus.PAID);
        splitCheckRepository.save(splitCheck);

        return Optional.of(splitCheck);


    }

    public void updateOrderStatus(Order order, BigDecimal paymentAmount) {
        BigDecimal previouslyPaidAmount = order.getPaidAmount() != null ? order.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal newTotalPaidAmount = previouslyPaidAmount.add(paymentAmount);

        order.setPaidAmount(newTotalPaidAmount);

        if (newTotalPaidAmount.compareTo(order.getTotal()) >= 0) {
            order.setStatus(OrderStatus.PAID);
        } else {
            order.setStatus(OrderStatus.PARTIALLY_PAID);
        }

    }


///  atskiras kiekis tipsai (kiekvienas splittintas zmogus gali prisideti savu tipsu)
    ///
}