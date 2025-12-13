package com.ffive.pos_system.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ffive.pos_system.dto.AddProductToOrderRequest;
import com.ffive.pos_system.dto.GUIOrder;
import com.ffive.pos_system.dto.ModifyOrderItemRequest;
import com.ffive.pos_system.dto.ModifyOrderRequest;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.OrderService;
import com.ffive.pos_system.util.PagingHelper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/order")
@Tag(name = "Order", description = "Order management endpoints")
@RequiredArgsConstructor
@PreAuthorize("@authorizationHelper.hasEmployee(authentication)")
public class OrderController {

    private final OrderService orderService;
    private final PagingHelper pagingHelper;

    @Operation(summary = "Create a new order")
    @PostMapping
    public ResponseEntity<Void> createOrder(@AuthenticationPrincipal POSUserDetails userDetails) {
        orderService.createOrder(userDetails);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get all orders for the authenticated user's business")
    @GetMapping
    public List<GUIOrder> getOrders(@AuthenticationPrincipal POSUserDetails userDetails,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<Integer> size) {
        return orderService.getAllOrders(
                userDetails,
                pagingHelper.getValidPageNumber(page),
                pagingHelper.getValidPageSize(size));
    }

    @Operation(summary = "Get a order by ID")
    @GetMapping("/{orderId}")
    public ResponseEntity<GUIOrder> getOrder(@AuthenticationPrincipal POSUserDetails userDetails,
            @Valid @PathVariable UUID orderId) {
        return ResponseEntity.ofNullable(orderService.getOrder(userDetails, orderId));
    }

    @Operation(summary = "Complete an existing order")
    @PostMapping("/{orderId}")
    public ResponseEntity<Void> completeOrder(@AuthenticationPrincipal POSUserDetails userDetails,
            @Valid @PathVariable UUID orderId) {
        orderService.completeOrder(userDetails, orderId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Modify an existing order item")
    @PutMapping("/{orderId}")
    public ResponseEntity<Void> modifyOrder(@AuthenticationPrincipal POSUserDetails userDetails,
            @Valid @PathVariable UUID orderId,
            @Valid @RequestBody ModifyOrderRequest modificationRequest) {
        orderService.modifyOrder(userDetails, orderId, modificationRequest);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Cancel an existing order")
    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> cancelOrder(@AuthenticationPrincipal POSUserDetails userDetails,
            @Valid @PathVariable UUID orderId) {
        orderService.cancelOrder(userDetails, orderId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Add product to an existing order")
    @PostMapping("/{orderId}/product")
    public ResponseEntity<Void> addProduct(@AuthenticationPrincipal POSUserDetails userDetails,
            @Valid @PathVariable UUID orderId,
            @Valid @RequestBody AddProductToOrderRequest addProductToOrderRequest) {
        orderService.addProductsToOrder(userDetails, orderId, addProductToOrderRequest);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Modify an existing order item")
    @PutMapping("/{orderId}/product/{orderItemId}")
    public ResponseEntity<Void> modifyOrderItem(@AuthenticationPrincipal POSUserDetails userDetails,
            @Valid @PathVariable UUID orderId,
            @Valid @PathVariable UUID orderItemId,
            @Valid @RequestBody ModifyOrderItemRequest modificationRequest) {
        orderService.modifyOrderItem(userDetails, orderId, orderItemId, modificationRequest);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Remove a product from an existing order")
    @DeleteMapping("/{orderId}/product/{orderItemId}")
    public ResponseEntity<Void> removeOrderItem(@AuthenticationPrincipal POSUserDetails userDetails,
            @Valid @PathVariable UUID orderId,
            @Valid @PathVariable UUID orderItemId) {
        orderService.removeProductFromOrder(userDetails, orderId, orderItemId);
        return ResponseEntity.ok().build();
    }

}
