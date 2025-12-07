package com.ffive.pos_system.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;

import org.springframework.stereotype.Service;

import com.ffive.pos_system.dto.AddProductToOrderRequest;
import com.ffive.pos_system.dto.GUIOrder;
import com.ffive.pos_system.dto.GUIOrderItem;
import com.ffive.pos_system.dto.GUIProduct;
import com.ffive.pos_system.dto.ModifyOrderItemRequest;
import com.ffive.pos_system.dto.ModifyOrderRequest;
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

    private static final int MAX_NOTE_LENGTH = 255;

    private static final Set<OrderStatus> CANCELLABLE_STATUSES = Set.of(OrderStatus.OPEN, OrderStatus.IN_PROGRESS);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    public void createOrder(POSUserDetails userDetails) {
        Employee employee = userDetails.getUser().getEmployee();
        var business = employee.getBusiness();

        Order newOrder = Order.builder()
                .employee(employee)
                .business(business)
                .createdAt(LocalDateTime.now())
                .status(OrderStatus.OPEN)
                .build();

        orderRepository.save(newOrder);
    }

    public void addProductsToOrder(POSUserDetails userDetails, UUID orderId,
            AddProductToOrderRequest addProductToOrderRequest) {
        if (addProductToOrderRequest.getQuantity() <= 0) {
            throw new ValidationException("Quantity must be greater than zero");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ValidationException("Order not found"));

        if (order.getStatus() != OrderStatus.OPEN) {
            throw new ValidationException("Cannot add products to a closed order");
        }

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
                .limit(100)
                .toList();
    }

    public void removeProductFromOrder(POSUserDetails userDetails, UUID orderId, UUID productId) {
        var orderItem = orderItemRepository.findById(productId)
                .orElseThrow(() -> new ValidationException("Order item not found"));

        orderItemRepository.delete(orderItem);
    }

    public void modifyOrder(POSUserDetails userDetails, UUID orderId, ModifyOrderRequest modificationRequest) {
        var order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ValidationException("Order not found"));

        if (modificationRequest.getName() != null && modificationRequest.getName().length() > MAX_NOTE_LENGTH) {
            throw new ValidationException("Note exceeds maximum length");
        }

        order.setNote(modificationRequest.getName());

        orderRepository.save(order);
    }

    public void modifyOrderItem(POSUserDetails userDetails,
            UUID orderId,
            UUID productId,
            ModifyOrderItemRequest modificationRequest) {
        if (modificationRequest.getQuantity() <= 0) {
            throw new ValidationException("Quantity must be greater than zero");
        }

        var orderItem = orderItemRepository.findById(productId)
                .orElseThrow(() -> new ValidationException("Order item not found"));

        orderItem.setQuantity(modificationRequest.getQuantity());

        orderItemRepository.save(orderItem);
    }

    public void cancelOrder(POSUserDetails userDetails, UUID orderId) {
        var order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ValidationException("Order not found"));

        if (!CANCELLABLE_STATUSES.contains(order.getStatus())) {
            throw new ValidationException("Order cannot be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    public void completeOrder(POSUserDetails userDetails, UUID orderId) {
        var order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ValidationException("Order not found"));

        if (order.getStatus() != OrderStatus.OPEN) {
            throw new ValidationException("Only open orders can be completed");
        }

        order.setStatus(OrderStatus.IN_PROGRESS);
        order.setTotal(orderItemRepository.findByOrderId(orderId).stream()
                .map(this::getItemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add));

        orderRepository.save(order);
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

    private BigDecimal getItemTotal(OrderItem orderItem) {
        return orderItem.getProduct().getPrice()
                .multiply(BigDecimal.valueOf(orderItem.getQuantity()));
    }

}
