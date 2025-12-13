package com.ffive.pos_system.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ffive.pos_system.converter.gui.OrderConverter;
import com.ffive.pos_system.dto.AddProductToOrderRequest;
import com.ffive.pos_system.dto.GUIOrder;
import com.ffive.pos_system.dto.ModifyOrderItemRequest;
import com.ffive.pos_system.dto.ModifyOrderRequest;
import com.ffive.pos_system.handler.OrderModificationHandler;
import com.ffive.pos_system.handler.OrderStateHandler;
import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.Order;
import com.ffive.pos_system.model.OrderItem;
import com.ffive.pos_system.model.OrderStatus;
import com.ffive.pos_system.repository.OrderItemRepository;
import com.ffive.pos_system.repository.OrderRepository;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.validation.ValidationException;
import com.ffive.pos_system.util.PagingHelper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final PagingHelper pagingHelper;

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderConverter orderConverter;

    private final OrderStateHandler orderStateHandler;
    private final OrderModificationHandler orderModificationHandler;

    public void createOrder(POSUserDetails userDetails) {
        orderStateHandler.createOrder(userDetails.getUser().getEmployee());
    }

    public void addProductsToOrder(POSUserDetails userDetails, UUID orderId,
            AddProductToOrderRequest addProductToOrderRequest) {
        Order order = fetchOrderById(orderId);
        orderModificationHandler.addProductsToOrder(order,
                userDetails.getUser().getEmployee(),
                addProductToOrderRequest);
    }

    public List<GUIOrder> getAllOrders(POSUserDetails userDetails, int page, int size) {
        Business business = userDetails.getUser().getEmployee().getBusiness();

        return orderRepository.findByBusinessId(business.getId()).stream()
                .skip(pagingHelper.calculateOffset(page, size))
                .limit(size)
                .map(orderConverter::convertOrder)
                .toList();
    }

    public void removeProductFromOrder(POSUserDetails userDetails, UUID orderId, UUID orderItemId) {
        orderModificationHandler.removeProductFromOrder(userDetails.getUser().getEmployee(),
                fetchOrderById(orderId),
                fetchOrderItemById(orderItemId));
    }

    public void modifyOrder(POSUserDetails userDetails, UUID orderId, ModifyOrderRequest modificationRequest) {
        Order order = fetchOrderById(orderId);

        orderModificationHandler.modifyOrder(userDetails.getUser().getEmployee(), order, modificationRequest);
    }

    public void modifyOrderItem(POSUserDetails userDetails,
            UUID orderId,
            UUID orderItemId,
            ModifyOrderItemRequest modificationRequest) {
        orderModificationHandler.modifyOrderIem(userDetails.getUser().getEmployee(),
                fetchOrderById(orderId),
                fetchOrderItemById(orderItemId),
                modificationRequest);
    }

    public void cancelOrder(POSUserDetails userDetails, UUID orderId) {
        Order order = fetchOrderById(orderId);
        orderStateHandler.cancelOrder(userDetails.getUser().getEmployee(), order);
    }

    public void completeOrder(POSUserDetails userDetails, UUID orderId) {
        Order order = fetchOrderById(orderId);
        orderStateHandler.completeOrder(userDetails.getUser().getEmployee(), order);
    }

    public GUIOrder getOrder(POSUserDetails userDetails, UUID orderId) {
        Order order = fetchOrderById(orderId);

        return order.getStatus() == OrderStatus.OPEN ? orderConverter.convertOrder(order)
                : orderConverter.convertOrderFromSnapshot(order);
    }

    private OrderItem fetchOrderItemById(UUID orderItemId) {
        var orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new ValidationException("Order item not found"));
        return orderItem;
    }

    private Order fetchOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ValidationException("Order not found"));
        return order;
    }
}
