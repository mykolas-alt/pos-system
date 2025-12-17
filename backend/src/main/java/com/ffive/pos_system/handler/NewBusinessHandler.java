package com.ffive.pos_system.handler;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.converter.BusinessConverter;
import com.ffive.pos_system.converter.EmployeeConverter;
import com.ffive.pos_system.dto.BusinessCreationRequest;
import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.POSUser;
import com.ffive.pos_system.repository.BusinessRepository;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.repository.UserRepository;
import com.ffive.pos_system.security.POSUserDetails;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class NewBusinessHandler {

    private final BusinessRepository businessRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final BusinessConverter businessConverter;
    private final EmployeeConverter employeeConverter;

    public Business handle(BusinessCreationRequest businessCreationRequest, POSUserDetails userDetails) {
        // TODO: add handler with validations inside

        Employee owner = employeeConverter.fromBusinessCreationRequest(businessCreationRequest);
        Business business = businessConverter.convertToBusiness(businessCreationRequest);

        return createBusinessAndSetOwner(business, owner, userDetails.getUser());
    }

    @Transactional
    private Business createBusinessAndSetOwner(Business business, Employee owner, POSUser posUser) {
        employeeRepository.save(owner);
        business.setOwner(owner);

        Business persistedBusiness = businessRepository.save(business);
        owner.setBusiness(persistedBusiness);

        Employee persistedEmployee = employeeRepository.save(owner);

        posUser.setEmployee(persistedEmployee);
        userRepository.save(posUser);

        return persistedBusiness;
    }
}
