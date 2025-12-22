package com.ffive.pos_system.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.ffive.pos_system.controller.ProductOptionGroupCreationRequest;
import com.ffive.pos_system.controller.ProductOptionValueCreationRequest;
import com.ffive.pos_system.converter.gui.GUIPageConverter;
import com.ffive.pos_system.dto.GUIPage;
import com.ffive.pos_system.dto.GUIProductOptionGroup;
import com.ffive.pos_system.dto.GUIProductOptionValue;
import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.model.ProductOptionGroup;
import com.ffive.pos_system.model.ProductOptionValue;
import com.ffive.pos_system.repository.ProductOptionGroupRepository;
import com.ffive.pos_system.repository.ProductOptionValueRepository;
import com.ffive.pos_system.repository.ProductRepository;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.validation.ValidationException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductOptionService {

    private final ProductOptionValueRepository productOptionValueRepository;
    private final ProductOptionGroupRepository productOptionGroupRepository;
    private final ProductRepository productRepository;

    private final GUIPageConverter pageConverter;

    public GUIProductOptionGroup createProductOptionGroup(POSUserDetails userDetails,
            ProductOptionGroupCreationRequest optionGroup) {

        Product product = productRepository.findById(optionGroup.getProductId())
                .orElseThrow(() -> new ValidationException("Could not find Product"));

        var value = ProductOptionGroup.builder()
                .name(optionGroup.getName())
                .minSelect(optionGroup.getMinSelect())
                .maxSelect(optionGroup.getMaxSelect())
                .type(optionGroup.getType())
                .product(product)
                .build();

        var savedEntity = productOptionGroupRepository.save(value);

        return convertToGUIOptionGroup(savedEntity);
    }

    public void deleteProductOptionGroup(POSUserDetails userDetails, UUID optionGroupId) {
        ProductOptionGroup optionGroup = Optional.ofNullable(optionGroupId)
                .flatMap(productOptionGroupRepository::findById)
                .orElseThrow(() -> new ValidationException("Could not find product option group to delete"));

        optionGroup.getOptionValues().forEach(value -> {
            productOptionValueRepository.delete(value);
        });

        productOptionGroupRepository.delete(optionGroup);
    }

    public GUIProductOptionValue createProductOptionValue(POSUserDetails userDetails,
            ProductOptionValueCreationRequest optionValue) {

        var optionGroup = productOptionGroupRepository.findById(optionValue.getOptionGroupId())
                .orElseThrow(() -> new ValidationException("Could not find product option group"));

        var value = ProductOptionValue.builder()
                .priceDelta(optionValue.getPriceDelta())
                .optionGroup(optionGroup)
                .name(optionValue.getName())
                .build();

        var savedEntity = productOptionValueRepository.save(value);

        return convertToGUIOptionValue(savedEntity);
    }

    public void deleteProductOptionValue(POSUserDetails userDetails, UUID optionValueId) {
        if (optionValueId == null || !productOptionValueRepository.existsById(optionValueId)) {
            throw new ValidationException("Could not find product option value to delete");
        }

        productOptionValueRepository.deleteById(optionValueId);
    }

    public GUIPage<GUIProductOptionGroup> getProductOptionGroupsForProduct(POSUserDetails userDetails, UUID productId,
            int pageNumber,
            int pageSize) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        Page<ProductOptionGroup> page = productOptionGroupRepository.findAllByProductIdAndDeletedAtIsNull(productId,
                pageable);
        return pageConverter.convertToGUIPage(page, this::convertToGUIOptionGroup);
    }

    public GUIPage<GUIProductOptionValue> getProductOptionValuesForOptionGroup(POSUserDetails userDetails,
            UUID optionGroupId, int pageNumber, int pageSize) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        var optionGroup = productOptionGroupRepository.findById(optionGroupId)
                .orElseThrow(() -> new ValidationException("Could not find product option group"));
        Page<ProductOptionValue> page = productOptionValueRepository.findAllByOptionGroupAndDeletedAtIsNull(optionGroup,
                pageable);
        return pageConverter.convertToGUIPage(page, this::convertToGUIOptionValue);
    }

    private GUIProductOptionGroup convertToGUIOptionGroup(ProductOptionGroup savedEntity) {
        return GUIProductOptionGroup.builder()
                .id(productOptionGroupRepository.save(savedEntity).getId())
                .name(savedEntity.getName())
                .minSelect(savedEntity.getMinSelect())
                .maxSelect(savedEntity.getMaxSelect())
                .type(savedEntity.getType())
                .productId(savedEntity.getProduct().getId())
                .build();
    }

    private GUIProductOptionValue convertToGUIOptionValue(ProductOptionValue savedEntity) {
        return GUIProductOptionValue.builder()
                .name(savedEntity.getName())
                .id(savedEntity.getId())
                .optionGroupId(savedEntity.getOptionGroup().getId())
                .priceDelta(savedEntity.getPriceDelta())
                .build();
    }
}
