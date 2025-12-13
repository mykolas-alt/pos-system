package com.ffive.pos_system.configuration;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.service.validation.rules.ValidationRule;
import com.ffive.pos_system.service.validation.rules.product.ProductNameValidationRule;
import com.ffive.pos_system.service.validation.rules.product.ProductPriceValidationRule;

@Configuration
public class ValidationFactoryConfig {

    @Bean
    public List<ValidationRule<Product>> productCreateValidationRuleFactory(
            ProductPriceValidationRule productPriceValidationRule,
            ProductNameValidationRule productNameValidationRule) {
        return List.of(
                productPriceValidationRule,
                productNameValidationRule);
    }

    // TODO: Different rules for update can be added later
    @Bean
    public List<ValidationRule<Product>> productUpdateValidationRuleFactory(
            ProductPriceValidationRule productPriceValidationRule,
            ProductNameValidationRule productNameValidationRule) {
        return List.of(
                productPriceValidationRule,
                productNameValidationRule);
    }
}
