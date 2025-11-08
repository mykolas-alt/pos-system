package com.ffive.pos_system.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.service.ProductService;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/product")
@Tag(name = "Product", description = "Product management endpoints")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping
    public String createProduct(String name, BigDecimal price) {
        productService.createProduct(name, price).toString();
        return "Product created";
    }

    @GetMapping
    public List<Product> getProducts() {
        return productService.getAllProducts();
    }
}
