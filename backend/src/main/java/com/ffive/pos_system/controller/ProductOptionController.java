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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ffive.pos_system.dto.GUIPage;
import com.ffive.pos_system.dto.GUIProductOptionGroup;
import com.ffive.pos_system.dto.GUIProductOptionValue;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.ProductOptionService;
import com.ffive.pos_system.util.PagingHelper;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/product-option")
@Tag(name = "Product option", description = "Product option management endpoints")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("@authorizationHelper.hasEmployee(authentication)")
public class ProductOptionController {

    private final ProductOptionService productOptionService;
    private final PagingHelper pagingHelper;

    @PostMapping("/group")
    public ResponseEntity<GUIProductOptionGroup> createOptionGroup(
            @RequestBody ProductOptionGroupCreationRequest optionGroup,
            @AuthenticationPrincipal POSUserDetails userDetails) {
        return ResponseEntity.ok(productOptionService.createProductOptionGroup(userDetails, optionGroup));
    }

    @GetMapping("/group/{productId}")
    public ResponseEntity<GUIPage<GUIProductOptionGroup>> getOptionGroups(@PathVariable UUID productId,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<Integer> size,
            @AuthenticationPrincipal POSUserDetails userDetails) {
        return ResponseEntity.ok(productOptionService.getProductOptionGroupsForProduct(userDetails,
                productId,
                pagingHelper.getValidPageNumber(page),
                pagingHelper.getValidPageSize(size)));
    }

    @DeleteMapping("/group/{productOptionGroupId}")
    public ResponseEntity<Void> deleteOptionGroup(
            @Valid @PathVariable UUID productOptionGroupId,
            @AuthenticationPrincipal POSUserDetails userDetails) {
        productOptionService.deleteProductOptionGroup(userDetails, productOptionGroupId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/value")
    public ResponseEntity<GUIProductOptionValue> createOptionValue(
            @RequestBody ProductOptionValueCreationRequest optionValue,
            @AuthenticationPrincipal POSUserDetails userDetails) {
        return ResponseEntity.ok(productOptionService.createProductOptionValue(userDetails, optionValue));
    }

    @GetMapping("/value/{optionGroupId}")
    public ResponseEntity<GUIPage<GUIProductOptionValue>> getOptionGroupValues(@PathVariable UUID optionGroupId,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<Integer> size,
            @AuthenticationPrincipal POSUserDetails userDetails) {
        return ResponseEntity.ok(productOptionService.getProductOptionValuesForOptionGroup(userDetails,
                optionGroupId,
                pagingHelper.getValidPageNumber(page),
                pagingHelper.getValidPageSize(size)));
    }

    @DeleteMapping("/value/{productOptionValueId}")
    public ResponseEntity<Void> deleteOptionValue(
            @Valid @PathVariable UUID productOptionValueId,
            @AuthenticationPrincipal POSUserDetails userDetails) {
        productOptionService.deleteProductOptionValue(userDetails, productOptionValueId);
        return ResponseEntity.ok().build();
    }
}
