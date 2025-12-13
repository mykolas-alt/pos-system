package com.ffive.pos_system.service.validation;

import java.util.List;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.service.validation.rules.ValidationRule;

@Component
public class ProductModifyValidator extends Validator<Product> {

    public ProductModifyValidator(
            @Qualifier("productModifyValidationRuleFactory") List<ValidationRule<Product>> rules) {
        super(rules);
    }
}
