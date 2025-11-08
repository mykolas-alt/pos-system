package com.ffive.pos_system.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.repository.ProductRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ProductService {

    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    public Product createProduct(Product product) {
        log.info("Creating product with name: " + product.getName() + " and price: " + product.getPrice());
        // TODO: Add validations :)
        return repo.save(product);
    }

    public List<Product> getAllProducts() {
        return repo.findAll();
    }
}
