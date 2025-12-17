package com.ffive.pos_system.converter;

import java.util.Optional;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.dto.BusinessCreationRequest;
import com.ffive.pos_system.dto.EmployeeCreationRequest;
import com.ffive.pos_system.model.Employee;
<<<<<<< HEAD
=======
import com.ffive.pos_system.repository.BusinessRepository;
>>>>>>> 59cedff (added hibernate for auditing, employee creation still WIP)
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

    public Employee fromBusinessCreationRequest(BusinessCreationRequest creationRequest) {
        if (creationRequest == null) {
            return null;
        }

        return Employee.builder()
                .name(creationRequest.getOwnerName())
                .email(creationRequest.getOwnerEmail())
                .build();
    }
}
