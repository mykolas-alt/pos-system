package com.ffive.pos_system.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.POSUser;
import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.repository.ProductRepository;
import com.ffive.pos_system.security.POSUserDetails;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @InjectMocks
    private ProductService productService;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private POSUserDetails posUserDetails;

    // TODO: fix test
    @Test
    void testCreateProduct() {
        Product product = new Product("Test Product", BigDecimal.TEN);
        UUID randomUUID = UUID.randomUUID();
        // when(posUserDetails.getEmployeeId()).thenReturn(randomUUID);
        when(employeeRepository.findById(randomUUID))
                .thenReturn(Optional.of(Employee.builder()
                        .business(Business.builder().build())
                        .build()));

        POSUserDetails userDetails = POSUserDetails.builder()
                // .employeeId(randomUUID)
                .build();
        productService.createProduct(product, userDetails);

        verify(productRepository).save(any());
    }

    @Test
    void testGetAllProducts() {
        UUID businessId = UUID.randomUUID();
        productService.getAllProducts(POSUserDetails.builder()
                .user(POSUser.builder()
                        .employee(Employee.builder()
                                .business(Business.builder()
                                        .id(businessId)
                                        .build())
                                .build())
                        .build())
                .build());

        verify(productRepository).findAllByBusiness(businessId);
    }
}
