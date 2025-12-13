package com.ffive.pos_system.converter;

import com.ffive.pos_system.dto.GUIBeautyService;
import com.ffive.pos_system.model.BeautyService;
import org.springframework.stereotype.Component;

@Component
public class BeautyServiceConverter {

    public GUIBeautyService convertToGUI(BeautyService service) {
        return GUIBeautyService.builder()
        .id(service.getId())
        .name(service.getName())
        .specialistId(service.getSpecialistId().getId())
        .duration(service.getDuration())
        .opensAt(service.getOpensAt())
        .closesAt(service.getClosesAt())
        .price(service.getPrice())
        .build();
    }
    
    public BeautyService convertToEntity(GUIBeautyService guiService) {
        BeautyService service = new BeautyService();
        service.setName(guiService.getName());
        //SpecialistId should be set separately after fetching Employee entity and adding the employee id to this
        service.setDuration(guiService.getDuration());
        service.setOpensAt(guiService.getOpensAt());
        service.setClosesAt(guiService.getClosesAt());
        service.setPrice(guiService.getPrice());
        return service;
    }
}
