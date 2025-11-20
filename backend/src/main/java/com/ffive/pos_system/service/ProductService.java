package com.ffive.pos_system.service;

import static com.ffive.pos_system.service.validation.ValidationMessageConstants.MODIFYING_NON_EXISTENT_ENTITY;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.repository.ProductRepository;
import com.ffive.pos_system.service.validation.ProductCreateValidator;

import jakarta.validation.ValidationException;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ProductService {

    private final ProductRepository repo;
    private final ProductCreateValidator productCreateValidator;

    public ProductService(ProductRepository repo, ProductCreateValidator productCreateValidator) {
        this.repo = repo;
        this.productCreateValidator = productCreateValidator;
    }

    public Product createProduct(Product product) {
        log.info("Creating product with name: " + product.getName() + " and price: " + product.getPrice());
        productCreateValidator.validate(product);

        return repo.save(product);
    }

    public Product modifyProduct(Product product) {
        if (product.getId() == null || !repo.existsById(product.getId())) {
            throw new ValidationException(MODIFYING_NON_EXISTENT_ENTITY);
        }
        log.info("Creating product with name: " + product.getName() + " and price: " + product.getPrice());
        productCreateValidator.validate(product);

        return repo.save(product);
    }

    public List<Product> getAllProducts() {
        return repo.findAll();
    }
}
