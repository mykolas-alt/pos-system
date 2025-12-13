package com.ffive.pos_system.service.validation.rules.product;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.service.validation.ValidationResult;

@Component
public class ProductPriceValidationRule extends ProductValidationRule {

    private static final String PRODUCT_PRICE_CANNOT_BE_NEGATIVE = "Product price cannot be negative.";

    @Override
    public ValidationResult test(Product entity) {
        if (entity.getPrice().signum() < 0) {
            return ValidationResult.failure(PRODUCT_PRICE_CANNOT_BE_NEGATIVE);
        }
        return ValidationResult.success();
    }
}
