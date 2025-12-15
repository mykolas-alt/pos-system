package com.ffive.pos_system.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ffive.pos_system.dto.GUIProduct;
import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.ProductService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/product")
@Tag(name = "Product", description = "Product management endpoints")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;

    @Operation(summary = "Create a new product")
    @PostMapping
    public String createProduct(@RequestBody Product product,
            @AuthenticationPrincipal POSUserDetails userDetails) {

        productService.createProduct(product, userDetails);
        return "Product created";
    }

    @Operation(summary = "Update an existing product")
    @PutMapping("/{productId}")
    public String updateProduct(@RequestBody Product product, @RequestParam UUID productId,
            @AuthenticationPrincipal POSUserDetails userDetails) {

        product.setId(productId);
        productService.modifyProduct(product, userDetails);
        return "Product created";
    }

    @Operation(summary = "Get all products for the authenticated user's business")
    @GetMapping
    public List<GUIProduct> getProducts(@AuthenticationPrincipal POSUserDetails userDetails) {
        return productService.getAllProducts(userDetails);
    }
}
