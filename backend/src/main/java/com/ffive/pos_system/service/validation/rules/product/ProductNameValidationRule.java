package com.ffive.pos_system.service.validation.rules.product;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.service.validation.ValidationResult;

@Component
public class ProductNameValidationRule extends ProductValidationRule {

    private static final String PRODUCT_NAME_CANNOT_BE_NULL_OR_BLANK = "Product name cannot be null or blank.";

    @Override
    public ValidationResult test(Product entity) {
        var name = entity.getName();
        if (StringUtils.isBlank(name)) {
            return ValidationResult.failure(PRODUCT_NAME_CANNOT_BE_NULL_OR_BLANK);
        }
        return ValidationResult.success();
    }
}
