package com.ffive.pos_system.service.validation;

import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.service.validation.rules.ValidationRule;

@Component
public class ProductCreateValidator extends Validator<Product> {

    public ProductCreateValidator(
            @Qualifier("productCreateValidationRuleFactory") List<ValidationRule<Product>> rules) {
        super(rules);
    }
}
