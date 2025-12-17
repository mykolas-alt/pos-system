package com.ffive.pos_system.converter;

import java.util.UUID;
import com.ffive.pos_system.dto.ServiceResponse;
import com.ffive.pos_system.dto.ServiceRequest;
import com.ffive.pos_system.model.POSService;
import com.ffive.pos_system.model.Employee;
import org.springframework.stereotype.Component;

@Component
public class ServiceConverter {

    public ServiceResponse convertToGUI(POSService service) {
        return ServiceResponse.builder()
        .id(service.getId())
        .name(service.getName())
        .duration(service.getDuration())
        .opensAt(service.getOpensAt())
        .closesAt(service.getClosesAt())
        .price(service.getPrice())
        .isActive(service.getIsActive())
        .specialistId(service.getSpecialist().getId())
        .build();
    }
    
    // on creation 
    public POSService convertToEntity(ServiceRequest request, UUID un, Employee specialist) {
        POSService service = new POSService();
        service.setName(request.getName());
        service.setSpecialist(specialist);
        service.setDuration(request.getDuration());
        service.setOpensAt(request.getOpensAt());
        service.setClosesAt(request.getClosesAt());
        service.setPrice(request.getPrice());
        return service;
    }
}
