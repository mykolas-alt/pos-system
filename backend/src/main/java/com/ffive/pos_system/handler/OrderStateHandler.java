package com.ffive.pos_system.handler;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.Order;
import com.ffive.pos_system.model.OrderItem;
import com.ffive.pos_system.model.OrderStatus;
import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.model.ProductOptionValue;
import com.ffive.pos_system.repository.OrderItemRepository;
import com.ffive.pos_system.repository.OrderRepository;
import com.ffive.pos_system.service.validation.ValidationException;
import com.ffive.pos_system.util.ItemTotalsHelper;
import com.ffive.pos_system.util.PriceModifierHelper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OrderStateHandler {

    private static final Set<OrderStatus> CANCELLABLE_STATUSES = Set.of(OrderStatus.OPEN, OrderStatus.IN_PROGRESS);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    private final PriceModifierHelper priceModifierHelper;
    private final ItemTotalsHelper itemTotalsHelper;

    public void createOrder(Employee employee) {
        var business = employee.getBusiness();

        Order newOrder = Order.builder()
                .employee(employee)
                .business(business)
                .createdAt(LocalDateTime.now())
                .status(OrderStatus.OPEN)
                .paidAmount(BigDecimal.ZERO)
                .build();

        orderRepository.save(newOrder);
    }

    public void cancelOrder(Employee employee, Order order) {
        if (!CANCELLABLE_STATUSES.contains(order.getStatus())) {
            throw new ValidationException("Order cannot be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    @Transactional
    public void completeOrder(Employee employee, Order order) {
        validateOrderAndEmployeeBusinessesAreEqual(order, employee);

        if (order.getStatus() != OrderStatus.OPEN) {
            throw new ValidationException("Only open orders can be completed");
        }

        order.setStatus(OrderStatus.IN_PROGRESS);
        order.getTaxes().forEach(tax -> {
            tax.setNameSnapshot(tax.getTax().getName());
            tax.setRateSnapshot(tax.getTax().getRate());
        });
        order.getDiscounts().forEach(discount -> {
            discount.setNameSnapshot(discount.getDiscount().getName());
            discount.setValueSnapshot(discount.getDiscount().getValue());
        });

        BigDecimal totalBeforeOrderTaxesAndDiscounts = order.getItems().stream()
                .map(this::setSnapshotFieldsForOrderItems)
                .map(itemTotalsHelper::getItemTotalFromEntities)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setTotal(priceModifierHelper.getPriceAfterModifiersFromEntities(
                order.getDiscounts(),
                order.getTaxes(),
                totalBeforeOrderTaxesAndDiscounts));

        orderRepository.save(order);
    }

    private void validateOrderAndEmployeeBusinessesAreEqual(Order order, Employee employee) {
        if (!Objects.equals(order.getBusiness().getId(), employee.getBusiness().getId())) {
            throw new ValidationException("Employee does not belong to the same business as the order");
        }
    }

    private OrderItem setSnapshotFieldsForOrderItems(OrderItem orderitem) {
        Product product = orderitem.getProduct();

        orderitem.setProductNameSnapshot(product.getName());
        orderitem.setUnitPriceSnapshot(product.getPrice());

        orderitem.getTaxes().forEach(tax -> {
            tax.setNameSnapshot(tax.getTax().getName());
            tax.setRateSnapshot(tax.getTax().getRate());
        });

        orderitem.getDiscounts().forEach(discount -> {
            discount.setNameSnapshot(discount.getDiscount().getName());
            discount.setValueSnapshot(discount.getDiscount().getValue());
        });

        orderitem.getItemOptions().forEach(option -> {
            option.setPriceDeltaSnapshot(Optional.ofNullable(option.getOptionValue())
                    .map(ProductOptionValue::getPriceDelta)
                    .orElse(BigDecimal.ZERO));
        });

        orderItemRepository.save(orderitem);
        return orderitem;
    }
}
