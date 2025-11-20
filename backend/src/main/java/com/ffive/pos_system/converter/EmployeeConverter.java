package com.ffive.pos_system.converter;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.dto.EmployeeCreationRequest;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.repository.EmployeeRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EmployeeConverter {

    private final EmployeeRepository employeeRepository;

    public Employee fromCreationRequest(EmployeeCreationRequest creationRequest) {
        if (creationRequest == null) {
            return null;
        }

        Employee employee = Employee.builder()
                .name(creationRequest.getName())
                .email(creationRequest.getEmail())
                .manager(Optional.ofNullable(creationRequest.getManagerId())
                        .flatMap(employeeRepository::findById)
                        .orElse(null))
                .build();

        return employee;
    }

    private POSUser toUserAccount(EmployeeCreationRequest creationRequest) {
        return POSUser.builder()
                .username(creationRequest.getEmail())
                .password(creationRequest.getPassword())
                .build();
    }
}
