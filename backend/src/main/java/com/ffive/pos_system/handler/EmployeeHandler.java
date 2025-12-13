package com.ffive.pos_system.handler;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.POSUser;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EmployeeHandler {

    private final PasswordEncoder passwordEncoder;

    public Employee handleNewEmployeeForBusiness(Employee employee) {
        // TODO: add validation

        // POSUser userAccount = employee.getUserAccount();
        // userAccount.setPasswordHash(passwordEncoder.encode(userAccount.getPassword()));

        return employee;
    }
}
