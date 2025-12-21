package com.ffive.pos_system.controller;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ffive.pos_system.dto.GUIPage;
import com.ffive.pos_system.dto.GUIProduct;
import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.ProductService;
import com.ffive.pos_system.util.PagingHelper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/product")
@Tag(name = "Product", description = "Product management endpoints")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("@authorizationHelper.hasEmployee(authentication)")
public class ProductController {

    private final ProductService productService;
    private final PagingHelper pagingHelper;

    @Operation(summary = "Create a new product")
    @PostMapping
    public GUIProduct createProduct(@RequestBody Product product,
            @AuthenticationPrincipal POSUserDetails userDetails) {

        return productService.createProduct(product, userDetails);
    }

    @Operation(summary = "Update an existing product")
    @PutMapping("/{productId}")
    public GUIProduct updateProduct(@RequestBody Product product, @PathVariable UUID productId,
            @AuthenticationPrincipal POSUserDetails userDetails) {

        product.setId(productId);
        return productService.modifyProduct(product, userDetails);
    }

    @Operation(summary = "Get all products for the authenticated user's business")
    @GetMapping
    public GUIPage<GUIProduct> getProducts(@AuthenticationPrincipal POSUserDetails userDetails,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<Integer> size) {
        return productService.getAllProducts(userDetails,
                pagingHelper.getValidPageNumber(page),
                pagingHelper.getValidPageSize(size));
    }
}
