package com.ffive.pos_system.service;

import static com.ffive.pos_system.service.validation.ValidationMessageConstants.MODIFYING_NON_EXISTENT_ENTITY;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.ffive.pos_system.dto.GUIProduct;
import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.POSUser;
import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.repository.ProductRepository;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.validation.ProductCreateValidator;
import com.ffive.pos_system.util.EmployeeHelper;

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
        Employee employee = EmployeeHelper.resolveEmployeeFromUserDetails(userDetails);
        productCreateValidator.validate(product);

        // TODO: handler
        product.setBusiness(employee.getBusiness());
        return productRepository.save(product);
    }

    public Product modifyProduct(Product product, POSUserDetails userDetails) {
        if (product.getId() == null) {
            throw new ValidationException(MODIFYING_NON_EXISTENT_ENTITY);
        }

        // very temporary solution to retain business association
        productRepository.findById(product.getId())
                .ifPresent(oldProduct -> product.setBusiness(oldProduct.getBusiness()));

        log.info("Creating product with name: " + product.getName() + " and price: " + product.getPrice());
        productCreateValidator.validate(product);

        return productRepository.save(product);
    }

    public List<GUIProduct> getAllProducts(POSUserDetails userDetails) {
        return Optional.ofNullable(userDetails.getUser())
                .map(POSUser::getEmployee)
                .map(Employee::getBusiness)
                .map(Business::getId)
                .map(productRepository::findAllByBusiness)
                .map(this::mapToGUIProducts)
                .orElseGet(() -> List.of());
    }

    private List<GUIProduct> mapToGUIProducts(List<Product> products) {
        return products.stream()
                .map(product -> GUIProduct.builder()
                        .id(product.getId())
                        .name(product.getName())
                        .price(product.getPrice())
                        .build())
                .toList();
    }
}
