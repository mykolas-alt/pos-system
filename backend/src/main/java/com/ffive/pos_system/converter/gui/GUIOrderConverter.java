package com.ffive.pos_system.converter.gui;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.dto.GUIOrder;
import com.ffive.pos_system.dto.GUIOrderItem;
import com.ffive.pos_system.dto.GUIProduct;
import com.ffive.pos_system.model.Order;

@Component
public class GUIOrderConverter {

    public GUIOrder convertOrderFromCurrentState(Order order) {
        return GUIOrder.builder()
                .id(order.getId())
                .createdAt(order.getCreatedAt())
                .closedAt(order.getClosedAt())
                .status(order.getStatus())
                .total(order.getItems().stream()
                        .map(item -> item.getProduct().getPrice().multiply(
                                java.math.BigDecimal.valueOf(item.getQuantity())))
                        .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add))
                .note(order.getNote())
                .identEmployee(order.getEmployee().getId())
                .items(order.getItems().stream()
                        .map(orderItem -> GUIOrderItem.builder()
                                .id(orderItem.getId())
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
}
