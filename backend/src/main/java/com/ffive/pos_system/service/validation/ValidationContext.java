package com.ffive.pos_system.service.validation;

import com.ffive.pos_system.model.Employee;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
public class ValidationContext {
    @Getter
    private final Employee executingEmployee;
}
