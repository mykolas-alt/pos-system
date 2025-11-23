package com.ffive.pos_system.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.ProductService;

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

    @PostMapping
    public String createProduct(@RequestBody Product product,
            @AuthenticationPrincipal POSUserDetails userDetails) {

        log.info("Employee ID: {}", userDetails.getEmployeeId());
        productService.createProduct(product, userDetails);
        return "Product created";
    }

    @GetMapping
    public List<Product> getProducts() {
        return productService.getAllProducts();
    }
}
