package com.ffive.pos_system.controller;

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

import com.ffive.pos_system.dto.DiscountCreationRequest;
import com.ffive.pos_system.dto.DiscountModificationRequest;
import com.ffive.pos_system.dto.GUIDiscount;
import com.ffive.pos_system.dto.GUIPage;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.DiscountService;
import com.ffive.pos_system.util.PagingHelper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/discount")
@Tag(name = "Discount", description = "Discount management endpoints")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("@authorizationHelper.hasEmployee(authentication)")
public class DiscountController {

    private final DiscountService discountService;
    private final PagingHelper pagingHelper;

    @Operation(summary = "Create a new discount")
    @PostMapping
    public ResponseEntity<GUIDiscount> createDiscount(@AuthenticationPrincipal POSUserDetails userDetails,
            @Valid @RequestBody DiscountCreationRequest discountCreationRequest) {
        return ResponseEntity.ok(discountService.createDiscount(userDetails, discountCreationRequest));
    }

    @Operation(summary = "Update an existing discount")
    @PutMapping("/{discountId}")
    public ResponseEntity<GUIDiscount> updateDiscount(@AuthenticationPrincipal POSUserDetails userDetails,
            @PathVariable UUID discountId,
            @Valid @RequestBody DiscountModificationRequest discountModificationRequest) {

        return ResponseEntity.ok(discountService.modifyDiscount(userDetails, discountId, discountModificationRequest));
    }

    @Operation(summary = "Deactivate an existing discount")
    @DeleteMapping("/{discountId}")
    public ResponseEntity<GUIDiscount> deactivateDiscount(@AuthenticationPrincipal POSUserDetails userDetails,
            @PathVariable UUID discountId) {

        return ResponseEntity.ok(discountService.deativateDiscount(userDetails, discountId));
    }

    @Operation(summary = "Get all discounts for the authenticated user's business")
    @GetMapping
    public GUIPage<GUIDiscount> getDiscounts(@AuthenticationPrincipal POSUserDetails userDetails,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<Integer> size) {
        return discountService.getAllDiscounts(userDetails,
                pagingHelper.getValidPageNumber(page),
                pagingHelper.getValidPageSize(size));
    }
}
