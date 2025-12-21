package com.ffive.pos_system.util;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.model.OrderItem;
import com.ffive.pos_system.model.OrderItemOption;
import com.ffive.pos_system.model.ProductOptionType;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ItemTotalsHelper {

    private final PriceModifierHelper priceModifierHelper;

    public BigDecimal getItemTotalFromEntities(OrderItem orderItem) {
        BigDecimal priceWithOptions = orderItem.getProduct().getPrice().add(
                orderItem.getItemOptions().stream()
                        .filter(option -> !Objects.equals(option.getOptionGroup().getType(), ProductOptionType.SLIDER))
                        .map(option -> Optional.ofNullable(option.getOptionValue())
                                .map(value -> value.getPriceDelta())
                                .orElse(BigDecimal.ZERO))
                        .reduce(BigDecimal.ZERO, BigDecimal::add));

        var priceBeforeTaxesAndDiscounts = priceWithOptions.multiply(BigDecimal.valueOf(orderItem.getQuantity()));

        return priceModifierHelper.getPriceAfterModifiersFromEntities(
                orderItem.getDiscounts(),
                orderItem.getTaxes(),
                priceBeforeTaxesAndDiscounts);
    }

    public BigDecimal getItemTotalFromSnapshots(OrderItem orderItem) {
        BigDecimal priceWithOptions = orderItem.getUnitPriceSnapshot().add(
                orderItem.getItemOptions().stream()
                        .filter(option -> !Objects.equals(option.getOptionGroup().getType(), ProductOptionType.SLIDER))
                        .map(OrderItemOption::getPriceDeltaSnapshot)
                        .reduce(BigDecimal.ZERO, BigDecimal::add));

        var priceBeforeTaxesAndDiscounts = priceWithOptions.multiply(BigDecimal.valueOf(orderItem.getQuantity()));

        return priceModifierHelper.getPriceAfterModifiersFromSnapshots(
                orderItem.getDiscounts(),
                orderItem.getTaxes(),
                priceBeforeTaxesAndDiscounts);
    }
}
