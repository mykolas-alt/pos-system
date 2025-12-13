package com.ffive.pos_system.converter.gui;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.dto.GUIOrder;
import com.ffive.pos_system.dto.GUIOrderItem;
import com.ffive.pos_system.dto.GUIProduct;
import com.ffive.pos_system.model.Order;
import com.ffive.pos_system.service.OrderService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OrderConverter {

    private final OrderService orderService;

    public GUIOrder convertOrder(Order order) {
        return GUIOrder.builder()
                .id(order.getId())
                .createdAt(order.getCreatedAt())
                .closedAt(order.getClosedAt())
                .status(order.getStatus())
                .total(order.getTotal())
                .identEmployee(order.getEmployee().getId())
                .items(orderService.orderItemRepository.findByOrderId(order.getId()).stream()
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
                .identEmployee(order.getEmployee().getId())
                .items(orderService.orderItemRepository.findByOrderId(order.getId()).stream()
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
