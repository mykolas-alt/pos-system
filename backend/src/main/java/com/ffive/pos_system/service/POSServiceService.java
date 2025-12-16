package com.ffive.pos_system.service;


import java.util.List;
import java.util.ArrayList;
import java.util.UUID;

import org.springframework.stereotype.Service;
import com.ffive.pos_system.model.POSService;
import com.ffive.pos_system.dto.ServiceRequest;
import com.ffive.pos_system.dto.ServiceResponse;
import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.repository.ServiceRepository;
import com.ffive.pos_system.service.validation.ValidationException;
import com.ffive.pos_system.converter.ServiceConverter;
import com.ffive.pos_system.dto.GUIBeautyService;
import com.ffive.pos_system.dto.ServiceRequest;
import com.ffive.pos_system.dto.ServiceResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;




@Service
@Slf4j
@RequiredArgsConstructor
public class POSServiceService {
    
    private final ServiceRepository serviceRepository;
    private final EmployeeRepository employeeRepository;
    private final ServiceConverter beautyServiceConverter;


    public List<ServiceResponse> listServicesByBusiness(POSUserDetails userDetails) {
        
        Business business = userDetails.getUser().getEmployee().getBusiness();
       
        List<ServiceResponse> result = new ArrayList<ServiceResponse>();
        List<POSService> allFound = serviceRepository.findAllByBusiness(business.getId());
        if (allFound.isEmpty()){
            return result;
        }
        for (POSService bs : allFound){
            ServiceResponse guiObj = beautyServiceConverter.convertToGUI(bs);
            result.add(guiObj);
        }

        return result;   
    }
    public ServiceResponse getServiceByIdAndBusiness(POSUserDetails userDetails, UUID serviceId) {
        Business business = userDetails.getUser().getEmployee().getBusiness();
        POSService found = serviceRepository.findByIdAndBusiness(serviceId, business.getId()).getFirst();
        ServiceResponse guiObj = beautyServiceConverter.convertToGUI(found);
        return guiObj;
        
    }
    
    public void createService(POSUserDetails userDetails, UUID specialsitId, ServiceRequest service) {
        //POSService newService = beautyServiceConverter.convertToEntity(service, specialsitId);


        POSService newService = new POSService();
        newService.setName(service.getName());
        newService.setDuration(service.getDuration());
        newService.setOpensAt(service.getOpensAt());
        serviceRepository.save(newService);
    }

    public POSService updateService(POSUserDetails userDetails, UUID serviceId, ServiceRequest guiObj){

        if (serviceId == null) {
            throw new ValidationException("service id cannot be empty");
        }
        if (guiObj == null) {
            throw new ValidationException("Service not specified or empty");
        }

     
            POSService found = serviceRepository.findById(serviceId).orElseThrow(() -> new ValidationException("Service not found"));
        
        if (guiObj.getName() != null && !found.getName().equals(guiObj.getName())   ){
               found.setName(guiObj.getName());
        }
         if (guiObj.getDuration() > 0 && found.getDuration() != guiObj.getDuration()){
              found.setDuration(guiObj.getDuration());
        }
         if (guiObj.getOpensAt() != null &&  found.getOpensAt() == null || !found.getOpensAt().equals(guiObj.getOpensAt())) {
            found.setOpensAt(guiObj.getOpensAt());
        }
        if (guiObj.getClosesAt() != null && found.getClosesAt() == null || !found.getClosesAt().equals(guiObj.getClosesAt())) {
            found.setClosesAt(guiObj.getClosesAt());
        }
        
        serviceRepository.save(found);
        return found;
       
    }

    public void deleteService(POSUserDetails userDetails, UUID serviceId){

        POSService found = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new ValidationException("Service not found"));
                found.setIsActive(false);
        serviceRepository.save(found);
    }

}
