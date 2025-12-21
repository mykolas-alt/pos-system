package com.ffive.pos_system.handler;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.model.DiscountType;
import com.ffive.pos_system.model.Discountable;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.Order;
import com.ffive.pos_system.model.OrderItem;
import com.ffive.pos_system.model.OrderStatus;
import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.model.TaxType;
import com.ffive.pos_system.model.Taxable;
import com.ffive.pos_system.repository.OrderItemRepository;
import com.ffive.pos_system.repository.OrderRepository;
import com.ffive.pos_system.service.validation.ValidationException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OrderStateHandler {

    private static final Set<OrderStatus> CANCELLABLE_STATUSES = Set.of(OrderStatus.OPEN, OrderStatus.IN_PROGRESS);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

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
                .map(this::getItemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        var totalBeforeOrderTaxes = getPriceAfterDiscounts(order.getDiscounts(),
                totalBeforeOrderTaxesAndDiscounts);

        order.setTotal(getPriceAfterTaxes(order.getTaxes(), totalBeforeOrderTaxes));

        orderRepository.save(order);
    }

    private void validateOrderAndEmployeeBusinessesAreEqual(Order order, Employee employee) {
        if (!Objects.equals(order.getBusiness().getId(), employee.getBusiness().getId())) {
            throw new ValidationException("Employee does not belong to the same business as the order");
        }
    }

    private BigDecimal getItemTotal(OrderItem orderItem) {
        var priceBeforeTaxesAndDiscounts = orderItem.getProduct().getPrice()
                .multiply(BigDecimal.valueOf(orderItem.getQuantity()));

        var priceBeforeTaxes = getPriceAfterDiscounts(orderItem.getDiscounts(), priceBeforeTaxesAndDiscounts);

        return getPriceAfterTaxes(orderItem.getTaxes(), priceBeforeTaxes);
    }

    private BigDecimal getPriceAfterDiscounts(List<? extends Discountable> discounts,
            BigDecimal priceBeforeTaxesAndDiscounts) {
        Map<DiscountType, BigDecimal> discountTotals = Map.of(
                DiscountType.FLAT, BigDecimal.ZERO,
                DiscountType.PERCENTAGE, BigDecimal.ZERO);

        discounts.forEach(discount -> {
            discountTotals.compute(discount.getDiscount().getType(),
                    (key, total) -> total.add(discount.getDiscount().getValue()));
        });

        var percentageDiscountRate = Optional.of(discountTotals.get(DiscountType.PERCENTAGE))
                .filter(rate -> rate.compareTo(BigDecimal.valueOf(100)) <= 0)
                .map(rate -> BigDecimal.ONE.subtract(rate.divide(BigDecimal.valueOf(100), 2, RoundingMode.DOWN)))
                .orElse(BigDecimal.ZERO);

        return Optional.of(priceBeforeTaxesAndDiscounts)
                .filter(price -> price.compareTo(discountTotals.get(DiscountType.FLAT)) <= 0)
                .map(price -> price.subtract(discountTotals.get(DiscountType.FLAT)))
                .map(priceAfterFlatDiscount -> priceAfterFlatDiscount.multiply(percentageDiscountRate))
                .orElse(BigDecimal.ZERO);
    }

    private BigDecimal getPriceAfterTaxes(List<? extends Taxable> taxables, BigDecimal priceBeforeTaxes) {
        Map<TaxType, BigDecimal> taxTotals = Map.of(
                TaxType.SERVICE_CHARGE, BigDecimal.ZERO,
                TaxType.CUSTOM_TAX, BigDecimal.ZERO);

        taxables.forEach(tax -> {
            taxTotals.compute(tax.getTax().getType(),
                    (key, total) -> total.add(tax.getTax().getRate()));
        });

        return priceBeforeTaxes
                .multiply(taxTotals.get(TaxType.CUSTOM_TAX))
                .add(taxTotals.get(TaxType.SERVICE_CHARGE));
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

        orderItemRepository.save(orderitem);
        return orderitem;
    }
}
