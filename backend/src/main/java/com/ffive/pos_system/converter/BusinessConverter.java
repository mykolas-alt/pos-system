package com.ffive.pos_system.converter;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.dto.BusinessCreationRequest;
import com.ffive.pos_system.model.Business;

@Component
public class BusinessConverter {

    public Business convertToBusiness(BusinessCreationRequest request) {
        return Business.builder()
                .name(request.getBusinessName())
                .address(request.getAddress())
                .contactInfo(request.getContactInfo())
                .build();
    }
}
