package com.ffive.pos_system.service;

import static com.ffive.pos_system.service.validation.ValidationMessageConstants.MODIFYING_NON_EXISTENT_ENTITY;

import org.springframework.stereotype.Service;

import com.ffive.pos_system.dto.BusinessCreationRequest;
import com.ffive.pos_system.handler.NewBusinessHandler;
import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.repository.BusinessRepository;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.security.POSUserDetails;
<<<<<<< HEAD
import com.ffive.pos_system.service.validation.ValidationException;

=======

import jakarta.validation.ValidationException;
>>>>>>> ce953e9 (added executing user injection)
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final EmployeeRepository employeeRepository;
    private final NewBusinessHandler newBusinessHandler;

    /**
     *
     * Creates a new business and sets the owner based on the provided user
     * details.
     * Updates the owner's business reference accordingly.
     *
     * @param businessCreationRequest business to be created
     * @param userDetails             details of the user creating the business
     *
     * @return newly created Business with owner set
     */
    public Business createBusiness(BusinessCreationRequest businessCreationRequest, POSUserDetails userDetails) {
        log.info("Creating business with name: " + businessCreationRequest.getBusinessName());
        return newBusinessHandler.handle(businessCreationRequest, userDetails);
    }

    public Business modifyBusiness(Business business) {
        if (business.getId() == null || !businessRepository.existsById(business.getId())) {
            throw new ValidationException(MODIFYING_NON_EXISTENT_ENTITY);
        }
        // TODO: add validator

        return businessRepository.save(business);
<<<<<<< HEAD
=======
    }

    public List<Business> getAllBusinesses() {
        return businessRepository.findAll();
>>>>>>> ce953e9 (added executing user injection)
    }
}
