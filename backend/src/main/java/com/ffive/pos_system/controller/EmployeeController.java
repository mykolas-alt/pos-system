package com.ffive.pos_system.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ffive.pos_system.dto.EmployeeCreationRequest;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.service.EmployeeService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/employee")
@Tag(name = "Employee", description = "Employee management endpoints")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    public String createEmployee(@RequestBody EmployeeCreationRequest creationRequest) {
        employeeService.createEmployeeForBusiness(creationRequest);
        return "Employee created";
    }

    @GetMapping
    public List<Employee> getEmployees() {
        return employeeService.getAllEmployees();
    }
}
