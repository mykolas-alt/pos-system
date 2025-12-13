package com.ffive.pos_system.converter.gui;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.dto.GUIBusiness;
import com.ffive.pos_system.model.Business;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class GUIBusinessConverter {

    private final GUIEmployeeConverter employeeConverter;

    public GUIBusiness convertToGUIBusiness(Business business) {
        if (business == null) {
            return null;
        }

        return GUIBusiness.builder()
                .id(business.getId())
                .owner(employeeConverter.convertToGUIEmployee(business.getOwner()))
                .name(business.getName())
                .address(business.getAddress())
                .build();
    }
}
