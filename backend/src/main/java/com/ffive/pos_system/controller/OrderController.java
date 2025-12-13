package com.ffive.pos_system.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ffive.pos_system.dto.AddProductToOrderRequest;
import com.ffive.pos_system.dto.GUIOrder;
import com.ffive.pos_system.dto.ModifyOrderItemRequest;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.OrderService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/order")
@Tag(name = "Order", description = "Order management endpoints")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @Operation(summary = "Create a new order")
    @PostMapping
    public ResponseEntity<Void> createOrder(@AuthenticationPrincipal POSUserDetails userDetails) {
        orderService.createOrder(userDetails);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get all orders for the authenticated user's business")
    @GetMapping
    public List<GUIOrder> getOrders(@AuthenticationPrincipal POSUserDetails userDetails) {
        return orderService.getAllOrders(userDetails);
    }

    @Operation(summary = "Add product to an existing order")
    @PostMapping("/{orderId}/product")
    public ResponseEntity<Void> addProduct(@AuthenticationPrincipal POSUserDetails userDetails,
            @PathVariable UUID orderId,
            @RequestBody AddProductToOrderRequest addProductToOrderRequest) {
        orderService.addProductsToOrder(userDetails, orderId, addProductToOrderRequest);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Modify an existing order item")
    @PutMapping("/{orderId}/product/{productId}")
    public ResponseEntity<Void> modifyOrderItem(@AuthenticationPrincipal POSUserDetails userDetails,
            @PathVariable UUID orderId,
            @PathVariable UUID productId,
            @RequestBody ModifyOrderItemRequest modificationRequest) {
        orderService.modifyOrderItem(userDetails, orderId, productId, modificationRequest);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Remove a product from an existing order")
    @DeleteMapping("/{orderId}/product/{productId}")
    public ResponseEntity<Void> removeOrderItem(@AuthenticationPrincipal POSUserDetails userDetails,
            @PathVariable UUID orderId,
            @PathVariable UUID productId) {
        orderService.removeProductFromOrder(userDetails, orderId, productId);
        return ResponseEntity.ok().build();
    }

}
