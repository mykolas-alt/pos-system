package com.ffive.pos_system.handler;

import java.util.Objects;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.dto.AddProductToOrderRequest;
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
import com.ffive.pos_system.service.validation.ValidationException;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OrderModificationHandler {

    private static final Set<OrderStatus> OPEN_TO_MODIFICATION_STATUSES = Set.of(OrderStatus.OPEN);
    private static final int MAX_NOTE_LENGTH = 255;

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    public void addProductsToOrder(Order order, Employee employee,
            AddProductToOrderRequest addProductToOrderRequest) {
        if (addProductToOrderRequest.getQuantity() <= 0) {
            throw new ValidationException("Quantity must be greater than zero");
        }

        validateOrderIsOpenToModification(order);
        validateOrderAndEmployeeBusinessesAreEqual(order, employee);

        Product product = productRepository.findById(addProductToOrderRequest.getProductId())
                .orElseThrow(() -> new ValidationException("Product not found"));

        var orderItem = createNew(order, product, addProductToOrderRequest);

        orderItemRepository.save(orderItem);
    }

    public void modifyOrder(Employee employee, Order order, ModifyOrderRequest modificationRequest) {
        validateOrderIsOpenToModification(order);
        validateOrderAndEmployeeBusinessesAreEqual(order, employee);

        if (modificationRequest.getName() != null && modificationRequest.getName().length() > MAX_NOTE_LENGTH) {
            throw new ValidationException("Note exceeds maximum length");
        }

        order.setNote(modificationRequest.getName());

        orderRepository.save(order);
    }

    public void removeProductFromOrder(Employee employee, Order order, OrderItem orderItem) {
        validateOrderIsOpenToModification(order);
        validateOrderItemBelongsToOrder(orderItem, order);
        validateOrderAndEmployeeBusinessesAreEqual(order, employee);

        orderItemRepository.delete(orderItem);
    }

    public void modifyOrderIem(Employee employee, Order order, OrderItem orderItem,
            ModifyOrderItemRequest modificationRequest) {
        validateOrderIsOpenToModification(order);
        validateOrderItemBelongsToOrder(orderItem, order);
        validateOrderAndEmployeeBusinessesAreEqual(order, employee);

        if (modificationRequest.getQuantity() <= 0) {
            throw new ValidationException("Quantity must be greater than zero");
        }

        orderItem.setQuantity(modificationRequest.getQuantity());

        orderItemRepository.save(orderItem);
    }

    private void validateOrderAndEmployeeBusinessesAreEqual(Order order, Employee employee) {
        if (!Objects.equals(order.getBusiness().getId(), employee.getBusiness().getId())) {
            throw new ValidationException("Employee does not belong to the same business as the order");
        }
    }

    private void validateOrderIsOpenToModification(Order order) {
        if (!OPEN_TO_MODIFICATION_STATUSES.contains(order.getStatus())) {
            throw new ValidationException("Cannot modify products for a closed order");
        }
    }

    private OrderItem createNew(Order order, Product product, AddProductToOrderRequest addProductToOrderRequest) {
        return OrderItem.builder()
                .order(order)
                .product(product)
                .quantity(addProductToOrderRequest.getQuantity())
                .build();
    }

    private void validateOrderItemBelongsToOrder(OrderItem orderItem, Order order) {
        if (orderItem.getOrder().getId() != order.getId()) {
            throw new ValidationException("Order item does not belong to the specified order");
        }
    }

}
