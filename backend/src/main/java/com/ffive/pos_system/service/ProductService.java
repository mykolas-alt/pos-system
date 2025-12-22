package com.ffive.pos_system.service;

import static com.ffive.pos_system.service.validation.ValidationMessageConstants.MODIFYING_NON_EXISTENT_ENTITY;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.ffive.pos_system.converter.gui.GUIPageConverter;
import com.ffive.pos_system.dto.GUIPage;
import com.ffive.pos_system.dto.GUIProduct;
import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.POSUser;
import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.repository.OrderItemRepository;
import com.ffive.pos_system.repository.ProductRepository;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.validation.ProductCreateValidator;
import com.ffive.pos_system.service.validation.ValidationException;
import com.ffive.pos_system.util.EmployeeHelper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductCreateValidator productCreateValidator;
    private final GUIPageConverter pageConverter;

    public GUIProduct createProduct(ProductCreationRequest productCreationRequest, POSUserDetails userDetails) {
        log.info("Creating product with name: " + productCreationRequest.getName() + " and price: "
                + productCreationRequest.getPrice());
        Employee employee = EmployeeHelper.resolveEmployeeFromUserDetails(userDetails);

        var product = Product.builder()
                .name(productCreationRequest.getName())
                .price(productCreationRequest.getPrice())
                .build();

        product.setBusiness(employee.getBusiness());
        productCreateValidator.validate(product, null);
        var persistedProduct = productRepository.save(product);

        return convertToGUIProduct(persistedProduct);
    }

    public GUIProduct modifyProduct(POSUserDetails userDetails, UUID productId,
            ProductModificationRequest modificationRequest) {
        var product = productRepository.findById(productId)
                .orElseThrow(() -> new ValidationException(MODIFYING_NON_EXISTENT_ENTITY));

        log.info("Modifying product with name: " + product.getName() + " and price: " + product.getPrice());

        Optional.ofNullable(modificationRequest.getName())
                .ifPresent(product::setName);
        Optional.ofNullable(modificationRequest.getPrice())
                .ifPresent(product::setPrice);

        productCreateValidator.validate(product, null);

        var persistedProduct = productRepository.save(product);
        return convertToGUIProduct(persistedProduct);
    }

    public GUIPage<GUIProduct> getAllProducts(POSUserDetails userDetails, int pageNumber, int pageSize) {
        Business business = Optional.ofNullable(userDetails.getUser())
                .map(POSUser::getEmployee)
                .map(Employee::getBusiness)
                .orElseThrow(() -> new ValidationException("Authenticated user is not associated with any business"));

        var page = productRepository.findAllByBusinessAndDeletedAtIsNull(business,
                PageRequest.of(pageNumber, pageSize));
        return pageConverter.convertToGUIPage(page, this::convertToGUIProduct);
    }

    private GUIProduct convertToGUIProduct(Product product) {
        return GUIProduct.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .build();
    }

    @Transactional
    public GUIProduct deleteProduct(POSUserDetails userDetails, UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ValidationException("Could not find product to delete"));

        productRepository.delete(product);
        orderItemRepository.deleteAllByProductIfOrderOpen(product);

        return convertToGUIProduct(product);
    }
}
