package com.ffive.pos_system.service;

import static com.ffive.pos_system.service.validation.ValidationMessageConstants.MODIFYING_NON_EXISTENT_ENTITY;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ffive.pos_system.converter.gui.GUIBusinessConverter;
import com.ffive.pos_system.dto.BusinessCreationRequest;
import com.ffive.pos_system.dto.GUIBusiness;
import com.ffive.pos_system.handler.NewBusinessHandler;
import com.ffive.pos_system.dto.BusinessCreationRequest;
import com.ffive.pos_system.handler.NewBusinessHandler;
import com.ffive.pos_system.dto.BusinessCreationRequest;
import com.ffive.pos_system.handler.NewBusinessHandler;
import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.repository.BusinessRepository;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.validation.ValidationException;
import com.ffive.pos_system.util.PagingHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class BusinessService {

    private final BusinessRepository businessRepository;
    private final NewBusinessHandler newBusinessHandler;

    private final PagingHelper pagingHelper;
    private final GUIBusinessConverter businessConverter;

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
     * @param page
     * @param size
     * @throws ValidationException if the user is not a super admin
     * @return
     *         List of all businesses
     */
    public List<GUIBusiness> getBusinessesAllBusinesses(POSUserDetails userDetails, int page, int size) {
        if (!userDetails.getUser().isSuperAdmin()) {
            throw new ValidationException("Only super admin users can access all businesses");
        }
        return businessRepository.findAll().stream()
                .skip(pagingHelper.calculateOffset(page, size))
                .limit(size)
                .map(businessConverter::convertToGUIBusiness)
                .toList();
    }

}
