package com.ffive.pos_system.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ffive.pos_system.dto.EmployeeCreationRequest;
import com.ffive.pos_system.dto.GUIEmployee;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.EmployeeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/employee")
@Tag(name = "Employee", description = "Employee management endpoints")
@RequiredArgsConstructor
@PreAuthorize("@authorizationHelper.hasEmployee(authentication)")
public class EmployeeController {

    private final EmployeeService employeeService;

    @Operation(summary = "Create a new employee for the authenticated user's business")
    @PostMapping
    public ResponseEntity<Void> createEmployee(@AuthenticationPrincipal POSUserDetails userDetails,
            @RequestBody EmployeeCreationRequest creationRequest) {
        employeeService.createEmployeeForBusiness(userDetails, creationRequest);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get all employees for the authenticated user's business")
    @GetMapping
    public List<GUIEmployee> getEmployees(@AuthenticationPrincipal POSUserDetails userDetails) {
        return employeeService.getAllEmployees(userDetails);
    }
}
