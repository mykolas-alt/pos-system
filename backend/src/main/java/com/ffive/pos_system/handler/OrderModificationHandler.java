package com.ffive.pos_system.handler;

import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.controller.AddDiscountToOrderItemRequest;
import com.ffive.pos_system.controller.AddDiscountToOrderRequest;
import com.ffive.pos_system.controller.AddTaxToOrderItemRequest;
import com.ffive.pos_system.dto.AddItemOptionToOrderRequest;
import com.ffive.pos_system.dto.AddProductToOrderRequest;
import com.ffive.pos_system.dto.ModifyOrderItemRequest;
import com.ffive.pos_system.dto.ModifyOrderRequest;
import com.ffive.pos_system.model.Discount;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.Order;
import com.ffive.pos_system.model.OrderDiscount;
import com.ffive.pos_system.model.OrderItem;
import com.ffive.pos_system.model.OrderItemDiscount;
import com.ffive.pos_system.model.OrderItemOption;
import com.ffive.pos_system.model.OrderItemTax;
import com.ffive.pos_system.model.OrderStatus;
import com.ffive.pos_system.model.OrderTax;
import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.model.Tax;
import com.ffive.pos_system.repository.DiscountRepository;
import com.ffive.pos_system.repository.OrderDiscountRepository;
import com.ffive.pos_system.repository.OrderItemDiscountRepository;
import com.ffive.pos_system.repository.OrderItemOptionRepository;
import com.ffive.pos_system.repository.OrderItemRepository;
import com.ffive.pos_system.repository.OrderItemTaxRepository;
import com.ffive.pos_system.repository.OrderRepository;
import com.ffive.pos_system.repository.OrderTaxRepository;
import com.ffive.pos_system.repository.ProductOptionGroupRepository;
import com.ffive.pos_system.repository.ProductOptionValueRepository;
import com.ffive.pos_system.repository.ProductRepository;
import com.ffive.pos_system.repository.TaxRepository;
import com.ffive.pos_system.service.validation.ValidationException;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OrderModificationHandler {

    private static final Set<OrderStatus> OPEN_TO_MODIFICATION_STATUSES = Set.of(OrderStatus.OPEN);
    private static final int MAX_NOTE_LENGTH = 255;

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderItemOptionRepository orderItemOptionRepository;

    private final ProductOptionGroupRepository productOptionGroupRepository;
    private final ProductOptionValueRepository productOptionValueRepository;
    private final ProductRepository productRepository;

    private final DiscountRepository discountRepository;
    private final OrderDiscountRepository orderDiscountRepository;
    private final OrderItemDiscountRepository orderItemDiscountRepository;

    private final TaxRepository taxRepository;
    private final OrderTaxRepository orderTaxRepository;
    private final OrderItemTaxRepository orderItemTaxRepository;

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

    public void addOptionToOrderItem(Employee employee, Order order, OrderItem orderItem,
            AddItemOptionToOrderRequest addItemOptionToOrderRequest) {
        validateOrderIsOpenToModification(order);
        validateOrderItemBelongsToOrder(orderItem, order);
        validateOrderAndEmployeeBusinessesAreEqual(order, employee);
        var option = productOptionGroupRepository.findById(addItemOptionToOrderRequest.getItemOptionId())
                .orElseThrow(validationException("Product option group not found"));

        if (!Objects.equals(orderItem.getProduct().getId(), option.getProduct().getId())) {
            throw new ValidationException("Option group does not belong to the product of the order item");
        }

        var itemOption = OrderItemOption.builder()
                .orderItem(orderItem)
                .optionGroup(option);

        switch (option.getType()) {
            case SLIDER:
                itemOption.value(addItemOptionToOrderRequest.getValue().orElseThrow(
                        validationException("Value must be provided for SLIDER option type")));
                break;
            case SINGLE, MULTI:
                UUID optionValueId = addItemOptionToOrderRequest.getOptionValueId()
                        .orElseThrow(validationException(
                                "Option value ID must be provided for SINGLE or MULTI option type"));
                itemOption.optionValue(productOptionValueRepository.findById(optionValueId)
                        .orElseThrow(validationException("Product option value not found")));
        }

        orderItemOptionRepository.save(itemOption.build());
    }

    public void removeOptionFromOrderItem(Employee employee, Order order, OrderItem orderItem, UUID orderItemOptionId) {
        validateOrderIsOpenToModification(order);
        validateOrderItemBelongsToOrder(orderItem, order);
        validateOrderAndEmployeeBusinessesAreEqual(order, employee);

        OrderItemOption orderItemOption = orderItemOptionRepository.findById(orderItemOptionId)
                .orElseThrow(validationException("Order item option not found"));

        validateOrderItemOptionBelongsToOrderItem(orderItem, orderItemOption);

        orderItemOptionRepository.delete(orderItemOption);
    }

    public void addDiscountToOrder(Order order, Employee employee,
            @Valid AddDiscountToOrderRequest addDiscountToOrderRequest) {
        validateOrderIsOpenToModification(order);
        validateOrderAndEmployeeBusinessesAreEqual(order, employee);

        Discount discount = discountRepository.findById(addDiscountToOrderRequest.getDiscountId())
                .orElseThrow(validationException("Discount not found"));

        OrderDiscount orderDiscount = OrderDiscount.builder()
                .order(order)
                .discount(discount)
                .expiresAt(addDiscountToOrderRequest.getExpiresAt())
                .build();

        orderDiscountRepository.save(orderDiscount);
    }

    public void removeDiscountFromOrder(Employee employee, Order order, OrderDiscount orderDiscount) {
        validateOrderIsOpenToModification(order);
        validateOrderDiscountBelongsToOrder(orderDiscount, order);
        validateOrderAndEmployeeBusinessesAreEqual(order, employee);

        orderDiscountRepository.delete(orderDiscount);
    }

    public void addTaxToOrder(Order order, Employee employee,
            @Valid AddTaxToOrderRequest addTaxToOrderRequest) {
        validateOrderIsOpenToModification(order);
        validateOrderAndEmployeeBusinessesAreEqual(order, employee);

        Tax tax = taxRepository.findById(addTaxToOrderRequest.getTaxId())
                .orElseThrow(validationException("Tax not found"));

        OrderTax orderTax = OrderTax.builder()
                .order(order)
                .tax(tax)
                .build();

        orderTaxRepository.save(orderTax);
    }

    public void removeTaxFromOrder(Employee employee, Order order, OrderTax orderTax) {
        validateOrderIsOpenToModification(order);
        validateOrderTaxBelongsToOrder(orderTax, order);
        validateOrderAndEmployeeBusinessesAreEqual(order, employee);

        orderTaxRepository.delete(orderTax);
    }

    public void addDiscountToOrderItem(Employee employee, Order order, OrderItem orderItem,
            AddDiscountToOrderItemRequest addItemDiscountToOrderRequest) {
        validateOrderIsOpenToModification(order);
        validateOrderItemBelongsToOrder(orderItem, order);
        validateOrderAndEmployeeBusinessesAreEqual(order, employee);
        var discount = discountRepository.findById(addItemDiscountToOrderRequest.getDiscountId())
                .orElseThrow(validationException("Discount not found"));

        var itemDiscount = OrderItemDiscount.builder()
                .orderItem(orderItem)
                .discount(discount)
                .expiresAt(addItemDiscountToOrderRequest.getExpiresAt())
                .build();

        orderItemDiscountRepository.save(itemDiscount);
    }

    public void removeDiscountFromOrderItem(Employee employee, Order order, OrderItem orderItem,
            UUID orderItemDiscountId) {
        validateOrderIsOpenToModification(order);
        validateOrderItemBelongsToOrder(orderItem, order);
        validateOrderAndEmployeeBusinessesAreEqual(order, employee);

        OrderItemDiscount orderItemDiscount = orderItemDiscountRepository.findById(orderItemDiscountId)
                .orElseThrow(validationException("Order item discount not found"));

        validateOrderItemDiscountBelongsToOrderItem(orderItem, orderItemDiscount);

        orderItemDiscountRepository.delete(orderItemDiscount);
    }

    public void addTaxToOrderItem(Employee employee, Order order, OrderItem orderItem,
            AddTaxToOrderItemRequest addItemTaxToOrderRequest) {
        validateOrderIsOpenToModification(order);
        validateOrderItemBelongsToOrder(orderItem, order);
        validateOrderAndEmployeeBusinessesAreEqual(order, employee);
        var tax = taxRepository.findById(addItemTaxToOrderRequest.getTaxId())
                .orElseThrow(validationException("Tax not found"));

        var itemTax = OrderItemTax.builder()
                .orderItem(orderItem)
                .tax(tax)
                .build();

        orderItemTaxRepository.save(itemTax);
    }

    public void removeTaxFromOrderItem(Employee employee, Order order, OrderItem orderItem,
            UUID orderItemTaxId) {
        validateOrderIsOpenToModification(order);
        validateOrderItemBelongsToOrder(orderItem, order);
        validateOrderAndEmployeeBusinessesAreEqual(order, employee);

        OrderItemTax orderItemTax = orderItemTaxRepository.findById(orderItemTaxId)
                .orElseThrow(validationException("Order item tax not found"));

        validateOrderItemTaxBelongsToOrderItem(orderItem, orderItemTax);

        orderItemTaxRepository.delete(orderItemTax);
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
        if (!Objects.equals(orderItem.getOrder().getId(), order.getId())) {
            throw new ValidationException("Order item does not belong to the specified order");
        }
    }

    private void validateOrderDiscountBelongsToOrder(OrderDiscount orderDiscount, Order order) {
        if (!Objects.equals(orderDiscount.getOrder().getId(), order.getId())) {
            throw new ValidationException("Order discount does not belong to the specified order");
        }
    }

    private void validateOrderItemOptionBelongsToOrderItem(OrderItem orderItem, OrderItemOption orderItemOption) {
        if (!Objects.equals(orderItem.getId(), orderItemOption.getOrderItem().getId())) {
            throw new ValidationException("Order item option does not belong to the specified order item");
        }
    }

    private Supplier<ValidationException> validationException(String message) {
        return () -> new ValidationException(message);
    }

    private void validateOrderTaxBelongsToOrder(OrderTax orderTax, Order order) {
        if (!Objects.equals(orderTax.getOrder().getId(), order.getId())) {
            throw new ValidationException("Order tax does not belong to the specified order");
        }
    }

    private void validateOrderItemDiscountBelongsToOrderItem(OrderItem orderItem, OrderItemDiscount orderItemDiscount) {
        if (!Objects.equals(orderItem.getId(), orderItemDiscount.getOrderItem().getId())) {
            throw new ValidationException("Order item discount does not belong to the specified order item");
        }
    }

    private void validateOrderItemTaxBelongsToOrderItem(OrderItem orderItem, OrderItemTax orderItemTax) {
        if (!Objects.equals(orderItem.getId(), orderItemTax.getOrderItem().getId())) {
            throw new ValidationException("Order item tax does not belong to the specified order item");
        }
    }
}
