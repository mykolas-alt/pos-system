package com.ffive.pos_system.service;

import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    public Product createProduct(String name, BigDecimal price) {
        Product entity = new Product(name, price);
        return repo.save(entity);
    }

    public List<Product> getAllProducts() {
        return repo.findAll();
    }
}
