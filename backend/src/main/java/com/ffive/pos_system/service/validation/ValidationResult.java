package com.ffive.pos_system.service.validation;

import lombok.Getter;

public class ValidationResult {

    private final boolean valid;

    @Getter
    private final String errorMessage;

    private ValidationResult(boolean isValid, String errorMessage) {
        this.errorMessage = errorMessage;
        this.valid = isValid;
    }

    public static ValidationResult success() {
        return new ValidationResult(true, null);
    }

    public static ValidationResult failure(String errorMessage) {
        return new ValidationResult(false, errorMessage);
    }

    public boolean isValid() {
        return valid;
    }
}
