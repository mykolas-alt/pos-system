package com.ffive.pos_system.service;

import static com.ffive.pos_system.service.validation.ValidationMessageConstants.MODIFYING_NON_EXISTENT_ENTITY;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.repository.ProductRepository;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.validation.ProductCreateValidator;

import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final EmployeeRepository employeeRepository;
    private final ProductCreateValidator productCreateValidator;

    public Product createProduct(Product product, POSUserDetails userDetails) {
        log.info("Creating product with name: " + product.getName() + " and price: " + product.getPrice());
        productCreateValidator.validate(product);

        // TODO: handler
        product.setBusiness(employeeRepository.findById(userDetails.getEmployeeId()).orElseThrow().getBusiness());
        return productRepository.save(product);
    }

    public Product modifyProduct(Product product) {
        if (product.getId() == null || !productRepository.existsById(product.getId())) {
            throw new ValidationException(MODIFYING_NON_EXISTENT_ENTITY);
        }
        log.info("Creating product with name: " + product.getName() + " and price: " + product.getPrice());
        productCreateValidator.validate(product);

        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
}
