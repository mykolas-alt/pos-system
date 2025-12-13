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
    
}
