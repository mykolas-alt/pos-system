package com.ffive.pos_system.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.ffive.pos_system.converter.EmployeeConverter;
import com.ffive.pos_system.dto.EmployeeCreationRequest;
import com.ffive.pos_system.handler.EmployeeHandler;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final EmployeeHandler employeeHandler;
    private final EmployeeConverter employeeConverter;

    public Employee createEmployeeForBusiness(EmployeeCreationRequest creationRequest) {
        return Optional.ofNullable(creationRequest)
                .map(employeeConverter::fromCreationRequest)
                .map(employeeHandler::handleNewEmployeeForBusiness)
                .orElse(null);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }
}
