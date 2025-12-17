<<<<<<< HEAD
package com.ffive.pos_system.service.validation.rules;

import com.ffive.pos_system.service.validation.ValidationContext;
import com.ffive.pos_system.service.validation.ValidationResult;

public interface ValidationRule<T> {
    public abstract ValidationResult test(T entity, ValidationContext context);
}
=======
package com.ffive.pos_system.service.validation.rules;

import com.ffive.pos_system.service.validation.ValidationResult;

public interface ValidationRule<T> {
    public abstract ValidationResult test(T entity);
}
>>>>>>> 1fc6bce ( Added BeautyService entity, controller DTO, tables)
