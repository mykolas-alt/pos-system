package com.ffive.pos_system.converter;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.dto.EmployeeCreationRequest;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.POSUser;
import com.ffive.pos_system.repository.BusinessRepository;
import com.ffive.pos_system.repository.EmployeeRepository;

@Component
public class EmployeeConverter {

    private final EmployeeRepository employeeRepository;
    private final BusinessRepository businessRepository;

    public EmployeeConverter(BusinessRepository businessRepository, EmployeeRepository employeeRepository) {
        this.businessRepository = businessRepository;
        this.employeeRepository = employeeRepository;
    }

    public Employee fromCreationRequest(EmployeeCreationRequest creationRequest) {
        if (creationRequest == null) {
            return null;
        }

        Employee employee = Employee.builder()
                .name(creationRequest.getName())
                .email(creationRequest.getEmail())
                .userAccount(toUserAccount(creationRequest))
                .manager(employeeRepository
                        .findById(creationRequest.getManagerId())
                        .orElse(null))
                .business(businessRepository
                        .findById(creationRequest.getBusinessId())
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
