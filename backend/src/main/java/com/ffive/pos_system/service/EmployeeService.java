package com.ffive.pos_system.service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ffive.pos_system.converter.gui.GUIEmployeeConverter;
import com.ffive.pos_system.dto.EmployeeCreationRequest;
import com.ffive.pos_system.dto.GUIEmployee;
import com.ffive.pos_system.handler.EmployeeHandler;
import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.POSUser;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.repository.UserRepository;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.validation.ValidationException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeHandler employeeHandler;
    private final GUIEmployeeConverter guiEmployeeConverter;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void createEmployeeForBusiness(POSUserDetails userDetails, EmployeeCreationRequest creationRequest) {
        var executingEmployee = userDetails.getUser().getEmployee();
        if (executingEmployee == null || executingEmployee.getBusiness() == null) {
            throw new IllegalStateException("Executing user is not associated with any business");
        }

        employeeHandler.handleNewEmployeeForBusiness(userDetails, creationRequest);
    }

    public List<GUIEmployee> getAllEmployees(POSUserDetails userDetails) {
        var id = Optional.ofNullable(userDetails.getUser())
                .map(POSUser::getEmployee)
                .map(Employee::getBusiness)
                .map(Business::getId);

        if (id.isEmpty()) {
            throw new IllegalStateException("User is not associated with any business");
        }

        return employeeRepository.findAllByBusiness(id.get()).stream()
                .map(guiEmployeeConverter::convertToGUIEmployee)
                .limit(100)
                .toList();
    }

    public GUIEmployee updateEmployee(POSUserDetails userDetails, UUID employeeId,
            EmployeeCreationRequest updateRequest) {
        var employee = employeeRepository.findById(employeeId)
                .orElseThrow(
                        () -> new ValidationException("Employee with ID " + employeeId + " does not exist"));

        var executingEmployee = userDetails.getUser().getEmployee();
        if (!Objects.equals(executingEmployee.getBusiness().getId(), employee.getBusiness().getId())) {
            throw new ValidationException("Employee with ID " + employeeId + " does not exist");
        }

        Optional.ofNullable(updateRequest.getName())
                .ifPresent(employee::setName);
        Optional.ofNullable(updateRequest.getEmail())
                .ifPresent(employee::setEmail);

        handlePOSUserUpdate(employee, updateRequest);

        employeeRepository.save(employee);
        return guiEmployeeConverter.convertToGUIEmployee(employee);
    }

    private void handlePOSUserUpdate(Employee employee, EmployeeCreationRequest updateRequest) {
        if (StringUtils.isBlank(updateRequest.getPassword()) && StringUtils.isBlank(updateRequest.getEmail())) {
            return;
        }

        var employeeUser = userRepository.findByEmployee(employee)
                .orElseThrow(() -> new IllegalStateException(
                        "No user account associated with employee ID " + employee.getId()));

        Optional.ofNullable(updateRequest.getEmail())
                .ifPresent(employeeUser::setUsername);
        Optional.ofNullable(updateRequest.getPassword())
                .map(passwordEncoder::encode)
                .ifPresent(employeeUser::setPasswordHash);

        userRepository.save(employeeUser);
    }
}
