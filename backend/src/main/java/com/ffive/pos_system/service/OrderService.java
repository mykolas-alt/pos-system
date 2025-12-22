package com.ffive.pos_system.service;

import java.util.Objects;
import java.util.UUID;
import java.util.function.Supplier;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.ffive.pos_system.controller.AddDiscountToOrderItemRequest;
import com.ffive.pos_system.controller.AddDiscountToOrderRequest;
import com.ffive.pos_system.controller.AddTaxToOrderItemRequest;
import com.ffive.pos_system.converter.gui.GUIOrderConverter;
import com.ffive.pos_system.converter.gui.GUIPageConverter;
import com.ffive.pos_system.dto.AddItemOptionToOrderRequest;
import com.ffive.pos_system.dto.AddProductToOrderRequest;
import com.ffive.pos_system.dto.GUIOrder;
import com.ffive.pos_system.dto.GUIPage;
import com.ffive.pos_system.dto.ModifyOrderItemRequest;
import com.ffive.pos_system.dto.ModifyOrderRequest;
import com.ffive.pos_system.handler.AddTaxToOrderRequest;
import com.ffive.pos_system.handler.OrderModificationHandler;
import com.ffive.pos_system.handler.OrderStateHandler;
import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.Order;
import com.ffive.pos_system.model.OrderDiscount;
import com.ffive.pos_system.model.OrderItem;
import com.ffive.pos_system.model.OrderStatus;
import com.ffive.pos_system.model.OrderTax;
import com.ffive.pos_system.repository.OrderDiscountRepository;
import com.ffive.pos_system.repository.OrderItemRepository;
import com.ffive.pos_system.repository.OrderRepository;
import com.ffive.pos_system.repository.OrderTaxRepository;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.validation.ValidationException;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderDiscountRepository orderDiscountRepository;
    private final OrderTaxRepository orderTaxRepository;

    private final GUIOrderConverter orderConverter;
    private final GUIPageConverter pageConverter;

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

    public GUIPage<GUIOrder> getAllOrders(POSUserDetails userDetails, int pageNumber, int size) {
        Business business = userDetails.getUser().getEmployee().getBusiness();

        Pageable pageable = PageRequest.of(pageNumber, size);
        Page<Order> page = orderRepository.findAllByBusiness(business, pageable);
        return pageConverter.convertToGUIPage(page, this::convertToGuiOrder);
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

        return convertToGuiOrder(order);
    }

    public void addOptionToOrderItem(POSUserDetails userDetails, UUID orderId, UUID orderItemId,
            AddItemOptionToOrderRequest addItemOptionToOrderRequest) {
        Order order = fetchOrderById(orderId);
        OrderItem orderItem = fetchOrderItemById(orderItemId);

        orderModificationHandler.addOptionToOrderItem(
                userDetails.getUser().getEmployee(),
                order,
                orderItem,
                addItemOptionToOrderRequest);
    }

    public void removeOptionFromOrderItem(POSUserDetails userDetails, UUID orderId, UUID orderItemId,
            UUID orderItemOptionId) {
        Order order = fetchOrderById(orderId);
        OrderItem orderItem = fetchOrderItemById(orderItemId);

        orderModificationHandler.removeOptionFromOrderItem(
                userDetails.getUser().getEmployee(),
                order,
                orderItem,
                orderItemOptionId);
    }

    public void addTaxToOrder(POSUserDetails userDetails, @Valid UUID orderId,
            @Valid AddTaxToOrderRequest addTaxToOrderRequest) {
        Order order = fetchOrderById(orderId);
        orderModificationHandler.addTaxToOrder(order,
                userDetails.getUser().getEmployee(),
                addTaxToOrderRequest);
    }

    public void removeTaxFromOrder(POSUserDetails userDetails, UUID orderId, UUID orderTaxId) {
        orderModificationHandler.removeTaxFromOrder(userDetails.getUser().getEmployee(),
                fetchOrderById(orderId),
                fetchOrderTaxById(orderTaxId));
    }

    public void addDiscountToOrder(POSUserDetails userDetails, @Valid UUID orderId,
            @Valid AddDiscountToOrderRequest addDiscountToOrderRequest) {
        Order order = fetchOrderById(orderId);
        orderModificationHandler.addDiscountToOrder(order,
                userDetails.getUser().getEmployee(),
                addDiscountToOrderRequest);
    }

    public void removeDiscountFromOrder(POSUserDetails userDetails, UUID orderId, UUID orderDiscountId) {
        orderModificationHandler.removeDiscountFromOrder(userDetails.getUser().getEmployee(),
                fetchOrderById(orderId),
                fetchOrderDiscountById(orderDiscountId));
    }

    public void addDiscountToOrderItem(POSUserDetails userDetails, UUID orderId, UUID orderItemId,
            AddDiscountToOrderItemRequest addItemDiscountToOrderRequest) {
        Order order = fetchOrderById(orderId);
        OrderItem orderItem = fetchOrderItemById(orderItemId);

        orderModificationHandler.addDiscountToOrderItem(
                userDetails.getUser().getEmployee(),
                order,
                orderItem,
                addItemDiscountToOrderRequest);
    }

    public void removeDiscountFromOrderItem(POSUserDetails userDetails, UUID orderId, UUID orderItemId,
            UUID orderItemDiscountId) {
        Order order = fetchOrderById(orderId);
        OrderItem orderItem = fetchOrderItemById(orderItemId);

        orderModificationHandler.removeDiscountFromOrderItem(
                userDetails.getUser().getEmployee(),
                order,
                orderItem,
                orderItemDiscountId);
    }

    public void addTaxToOrderItem(POSUserDetails userDetails, UUID orderId, UUID orderItemId,
            AddTaxToOrderItemRequest addItemTaxToOrderRequest) {
        Order order = fetchOrderById(orderId);
        OrderItem orderItem = fetchOrderItemById(orderItemId);

        orderModificationHandler.addTaxToOrderItem(
                userDetails.getUser().getEmployee(),
                order,
                orderItem,
                addItemTaxToOrderRequest);
    }

    public void removeTaxFromOrderItem(POSUserDetails userDetails, UUID orderId, UUID orderItemId,
            UUID orderItemTaxId) {
        Order order = fetchOrderById(orderId);
        OrderItem orderItem = fetchOrderItemById(orderItemId);

        orderModificationHandler.removeTaxFromOrderItem(
                userDetails.getUser().getEmployee(),
                order,
                orderItem,
                orderItemTaxId);
    }

    private GUIOrder convertToGuiOrder(Order order) {
        if (Objects.equals(order.getStatus(), OrderStatus.OPEN)) {
            return orderConverter.convertOrderFromCurrentState(order);
        } else {
            return orderConverter.convertOrderFromSnapshot(order);
        }
    }

    private OrderItem fetchOrderItemById(UUID orderItemId) {
        var orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(validationException("Order item not found"));
        return orderItem;
    }

    private Order fetchOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(validationException("Order not found"));
        return order;
    }

    private Supplier<ValidationException> validationException(String message) {
        return () -> new ValidationException(message);
    }

    private OrderTax fetchOrderTaxById(UUID orderTaxId) {
        var orderItem = orderTaxRepository.findById(orderTaxId)
                .orElseThrow(validationException("Order tax not found"));
        return orderItem;
    }

    private OrderDiscount fetchOrderDiscountById(UUID orderDiscountId) {
        var orderItem = orderDiscountRepository.findById(orderDiscountId)
                .orElseThrow(validationException("Order discount not found"));
        return orderItem;
    }
}
