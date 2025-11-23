package com.ffive.pos_system.service;

import static com.ffive.pos_system.service.validation.ValidationMessageConstants.MODIFYING_NON_EXISTENT_ENTITY;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.repository.BusinessRepository;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.security.POSUserDetails;

import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final EmployeeRepository employeeRepository;

    public Business createBusiness(Business business, POSUserDetails userDetails) {
        log.info("Creating business with name: " + business.getName());
        // TODO: add handler with validations inside

        business.setOwner(employeeRepository.findById(userDetails.getEmployeeId()).orElseThrow());
        return businessRepository.save(business);
    }

    public Business modifyBusiness(Business business) {
        if (business.getId() == null || !businessRepository.existsById(business.getId())) {
            throw new ValidationException(MODIFYING_NON_EXISTENT_ENTITY);
        }
        // TODO: add validator

        return businessRepository.save(business);
    }

    public List<Business> getAllBusinesses() {
        return businessRepository.findAll();
    }
}
