package com.ffive.pos_system.controller;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ffive.pos_system.service.ProductService;

@RestController
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/create-product")
    public String createProduct() {
        long randomPrice = 5 + (long) (Math.random() * 11);
        productService.createProduct("Sample Product", BigDecimal.valueOf(randomPrice)).toString();
        return "Product created";
    }

    @GetMapping("/get-products")
    public String getProducts() {
        return "<ul>" +
                productService.getAllProducts().stream()
                        .map(product -> "<li>" + String.valueOf(product) + "</li>")
                        .reduce("", (a, b) -> a + b)
                + "</ul>";
    }
}
