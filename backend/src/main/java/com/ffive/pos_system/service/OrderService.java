package com.ffive.pos_system.service;

import java.util.List;
import java.util.UUID;
import java.util.function.Function;

import org.springframework.stereotype.Service;

import com.ffive.pos_system.dto.AddProductToOrderRequest;
import com.ffive.pos_system.dto.GUIOrder;
import com.ffive.pos_system.dto.GUIOrderItem;
import com.ffive.pos_system.dto.GUIProduct;
import com.ffive.pos_system.dto.ModifyOrderItemRequest;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.Order;
import com.ffive.pos_system.model.OrderItem;
import com.ffive.pos_system.model.OrderStatus;
import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.repository.OrderItemRepository;
import com.ffive.pos_system.repository.OrderRepository;
import com.ffive.pos_system.repository.ProductRepository;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.validation.ValidationException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    public void createOrder(POSUserDetails userDetails) {
        Employee employee = userDetails.getUser().getEmployee();
        var business = employee.getBusiness();

        Order newOrder = Order.builder()
                .employee(employee)
                .business(business)
                .status(OrderStatus.OPEN)
                .build();

        orderRepository.save(newOrder);
    }

    public void addProductsToOrder(POSUserDetails userDetails, UUID orderId,
            AddProductToOrderRequest addProductToOrderRequest) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ValidationException("Order not found"));

        Product product = productRepository.findById(addProductToOrderRequest.getProductId())
                .orElseThrow(() -> new ValidationException("Product not found"));

        var orderItem = orderItemRepository.findByOrderIdAndProductId(order.getId(), product.getId())
                .map(addToExistingOrderItem(addProductToOrderRequest))
                .orElseGet(() -> createNew(order, product, addProductToOrderRequest));

        orderItemRepository.save(orderItem);
    }

    public List<GUIOrder> getAllOrders(POSUserDetails userDetails) {
        var business = userDetails.getUser().getEmployee().getBusiness();
        var orders = orderRepository.findByBusinessId(business.getId());

        return orders.stream()
                .map(order -> GUIOrder.builder()
                        .id(order.getId())
                        .createdAt(order.getCreatedAt())
                        .closedAt(order.getClosedAt())
                        .status(order.getStatus())
                        .total(order.getTotal())
                        .identEmployee(order.getEmployee().getId())
                        .items(orderItemRepository.findByOrderId(order.getId()).stream()
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
                        .build())
                .toList();
    }

    public void removeProductFromOrder(POSUserDetails userDetails, UUID orderId, UUID productId) {
        var orderItem = orderItemRepository.findById(productId)
                .orElseThrow(() -> new ValidationException("Order item not found"));

        orderItemRepository.delete(orderItem);
    }

    public void modifyOrderItem(POSUserDetails userDetails,
            UUID orderId,
            UUID productId,
            ModifyOrderItemRequest modificationRequest) {
        var orderItem = orderItemRepository.findById(productId)
                .orElseThrow(() -> new ValidationException("Order item not found"));

        orderItem.setQuantity(modificationRequest.getQuantity());

        orderItemRepository.save(orderItem);
    }

    private OrderItem createNew(Order order, Product product, AddProductToOrderRequest addProductToOrderRequest) {
        return OrderItem.builder()
                .order(order)
                .product(product)
                .quantity(addProductToOrderRequest.getQuantity())
                .build();
    }

    private Function<OrderItem, OrderItem> addToExistingOrderItem(
            AddProductToOrderRequest addProductToOrderRequest) {
        return orderItem -> {
            orderItem.setQuantity(orderItem.getQuantity() + addProductToOrderRequest.getQuantity());
            return orderItemRepository.save(orderItem);
        };
    }

}
