package com.ffive.pos_system.service;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.any;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.repository.ProductRepository;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @InjectMocks
    private ProductService productService;
    @Mock
    private ProductRepository productRepository;

    @Test
    void testCreateProduct() {
        Product product = new Product("Test Product", BigDecimal.TEN);
        productService.createProduct(product);

        verify(productRepository).save(any());
    }

    @Test
    void testGetAllProducts() {
        productService.getAllProducts();

        verify(productRepository).findAll();
    }
}
