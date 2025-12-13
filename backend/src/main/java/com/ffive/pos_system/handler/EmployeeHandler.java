package com.ffive.pos_system.handler;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.ffive.pos_system.converter.EmployeeConverter;
import com.ffive.pos_system.dto.EmployeeCreationRequest;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.POSUser;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.repository.UserRepository;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.validation.ValidationException;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EmployeeHandler {

    private final PasswordEncoder passwordEncoder;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final EmployeeConverter employeeConverter;

    public void handleNewEmployeeForBusiness(POSUserDetails userDetails, EmployeeCreationRequest creationRequest) {
        Employee employee = employeeConverter.fromCreationRequest(creationRequest);

        employee.setBusiness(userDetails.getUser().getEmployee().getBusiness());

        if (employee.getName() != null && employee.getName().length() > 255) {
            throw new ValidationException("Employee name cannot exceed 255 characters");
        }

        if (employee.getEmail() != null && employee.getEmail().length() > 255) {
            throw new ValidationException("Employee email cannot exceed 255 characters");
        }

        POSUser userAccount = POSUser.builder()
                .username(employee.getEmail())
                .passwordHash(passwordEncoder.encode(creationRequest.getPassword()))
                .employee(employee)
                .build();

        employeeRepository.save(employee);
        userRepository.save(userAccount);
    }
}
