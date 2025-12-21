package com.ffive.pos_system.service;

import static com.ffive.pos_system.service.validation.ValidationMessageConstants.MODIFYING_NON_EXISTENT_ENTITY;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.ffive.pos_system.converter.gui.GUIBusinessConverter;
import com.ffive.pos_system.converter.gui.GUIPageConverter;
import com.ffive.pos_system.dto.BusinessCreationRequest;
import com.ffive.pos_system.dto.GUIBusiness;
import com.ffive.pos_system.dto.GUIPage;
import com.ffive.pos_system.handler.NewBusinessHandler;
import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.repository.BusinessRepository;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.validation.ValidationException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final NewBusinessHandler newBusinessHandler;

    private final GUIBusinessConverter businessConverter;
    private final GUIPageConverter pageConverter;

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
    }

    /**
     * Fetches all businesses in the system. Only accessible by super admin users.
     * 
     * @param userDetails
     * @param pageNumber
     * @param size
     * @throws ValidationException if the user is not a super admin
     * @return
     *         List of all businesses
     */
    public GUIPage<GUIBusiness> getBusinessesAllBusinesses(POSUserDetails userDetails, int pageNumber, int size) {
        if (!userDetails.getUser().isSuperAdmin()) {
            throw new ValidationException("Only super admin users can access all businesses");
        }
        Pageable pageable = PageRequest.of(pageNumber, size);
        Page<Business> businessPage = businessRepository.findAll(pageable);

        return pageConverter.convertToGUIPage(businessPage, businessConverter::convertToGUIBusiness);
    }

    public Optional<GUIBusiness> getBusinessForExecutingUser(Employee employee) {
        return Optional.ofNullable(employee)
                .map(Employee::getBusiness)
                .map(businessConverter::convertToGUIBusiness);
    }
}
