package com.ffive.pos_system.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.ffive.pos_system.converter.gui.GUIEmployeeConverter;
import com.ffive.pos_system.dto.EmployeeCreationRequest;
import com.ffive.pos_system.dto.GUIEmployee;
import com.ffive.pos_system.handler.EmployeeHandler;
import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.POSUser;
import com.ffive.pos_system.repository.EmployeeRepository;
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

    public void createEmployeeForBusiness(POSUserDetails userDetails, EmployeeCreationRequest creationRequest) {
        var executingEmployee = userDetails.getUser().getEmployee();
        if (executingEmployee == null || executingEmployee.getBusiness() == null) {
            throw new IllegalStateException("Executing user is not associated with any business");
        }

        // TODO: add role check for business owner / super admin
        if (executingEmployee.getBusiness().getOwner().getId() != executingEmployee.getId()) {
            throw new ValidationException("Only business owners can create new employees");
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
}
