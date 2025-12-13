package com.ffive.pos_system.service.validation.rules;

import com.ffive.pos_system.service.validation.ValidationResult;

public interface ValidationRule<T> {
    public abstract ValidationResult test(T entity);
}
