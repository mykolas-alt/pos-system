package com.ffive.pos_system.converter.gui;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.dto.GUIOrder;
import com.ffive.pos_system.dto.GUIOrderItem;
import com.ffive.pos_system.dto.GUIOrderItemOption;
import com.ffive.pos_system.dto.GUIProduct;
import com.ffive.pos_system.model.Order;
import com.ffive.pos_system.model.ProductOptionType;
import com.ffive.pos_system.model.ProductOptionValue;

@Component
public class GUIOrderConverter {

    public GUIOrder convertOrderFromCurrentState(Order order) {
        return GUIOrder.builder()
                .id(order.getId())
                .createdAt(order.getCreatedAt())
                .closedAt(order.getClosedAt())
                .status(order.getStatus())
                .total(calculateTotalFronCurrentState(order))
                .note(order.getNote())
                .identEmployee(order.getEmployee().getId())
                .items(order.getItems().stream()
                        .map(orderItem -> GUIOrderItem.builder()
                                .id(orderItem.getId())
                                .options(orderItem.getItemOptions().stream()
                                        .map(option -> GUIOrderItemOption.builder()
                                                .orderItemOptionId(option.getId())
                                                .groupId(option.getOptionGroup().getId())
                                                .groupName(option.getOptionGroup().getName())
                                                .type(option.getOptionGroup().getType())
                                                .valueId(Optional.ofNullable(option.getOptionValue())
                                                        .map(ProductOptionValue::getId).orElse(null))
                                                .valueName(Optional.ofNullable(option.getOptionValue())
                                                        .map(ProductOptionValue::getName).orElse(null))
                                                .priceDelta(Optional.ofNullable(option.getOptionValue())
                                                        .map(ProductOptionValue::getPriceDelta).orElse(null))
                                                .value(option.getValue())
                                                .build())
                                        .toList())
                                .product(GUIProduct.builder()
                                        .id(orderItem.getProduct().getId())
                                        .name(orderItem.getProduct().getName())
                                        .price(orderItem.getProduct().getPrice())
                                        .build())
                                .quantity(orderItem.getQuantity())
                                .build())
                        .toList())
                .build();
    }

    public GUIOrder convertOrderFromSnapshot(Order order) {
        return GUIOrder.builder()
                .id(order.getId())
                .createdAt(order.getCreatedAt())
                .closedAt(order.getClosedAt())
                .status(order.getStatus())
                .total(order.getTotal())
                .note(order.getNote())
                .identEmployee(order.getEmployee().getId())
                .items(order.getItems().stream()
                        .map(orderItem -> GUIOrderItem.builder()
                                .id(orderItem.getId())
                                .options(orderItem.getItemOptions().stream()
                                        .map(option -> GUIOrderItemOption.builder()
                                                .orderItemOptionId(option.getId())
                                                .groupId(option.getOptionGroup().getId())
                                                .groupName(option.getOptionGroup().getName())
                                                .type(option.getOptionGroup().getType())
                                                .valueId(Optional.ofNullable(option.getOptionValue())
                                                        .map(ProductOptionValue::getId).orElse(null))
                                                .valueName(Optional.ofNullable(option.getOptionValue())
                                                        .map(ProductOptionValue::getName).orElse(null))
                                                .priceDelta(Optional.ofNullable(option.getOptionValue())
                                                        .map(ProductOptionValue::getPriceDelta).orElse(null))
                                                .value(option.getValue())
                                                .build())
                                        .toList())
                                .product(GUIProduct.builder()
                                        .id(orderItem.getProduct().getId())
                                        .name(orderItem.getProductNameSnapshot())
                                        .price(orderItem.getUnitPriceSnapshot())
                                        .build())
                                .quantity(orderItem.getQuantity())
                                .build())
                        .toList())
                .build();
    }

    private BigDecimal calculateTotalFronCurrentState(Order order) {
        return order.getItems().stream()
                .map(item -> item.getProduct().getPrice().add(item.getItemOptions().stream()
                        .filter(option -> option.getOptionGroup().getType() != ProductOptionType.SLIDER)
                        .map(option -> option.getOptionValue().getPriceDelta())
                        .filter(Objects::nonNull)
                        .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add))
                        .multiply(java.math.BigDecimal.valueOf(item.getQuantity())))
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
    }
}
