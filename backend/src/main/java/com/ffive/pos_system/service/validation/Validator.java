package com.ffive.pos_system.service.validation;

import java.util.List;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.service.validation.rules.ValidationRule;

@Component
public class Validator<T> {

    private final List<ValidationRule<T>> rules;

    public Validator(List<ValidationRule<T>> rules) {
        this.rules = rules;
    }

    public void validate(T entity, ValidationContext context) {
        rules.stream()
                .map(rule -> rule.test(entity, context))
                .filter(result -> !result.isValid())
                .findFirst()
                .ifPresent(res -> {
                    throw new ValidationException(res.getErrorMessage());
                });
    }
}
