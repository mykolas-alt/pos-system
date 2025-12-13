package com.ffive.pos_system.service;

import static com.ffive.pos_system.service.validation.ValidationMessageConstants.MODIFYING_NON_EXISTENT_ENTITY;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.ffive.pos_system.dto.GUIProduct;
import com.ffive.pos_system.dto.GUIBeautyService;
import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.BeautyService;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.POSUser;
import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.repository.ProductRepository;
import com.ffive.pos_system.repository.BeautyServiceRepository;
import com.ffive.pos_system.converter.BeautyServiceConverter;
import com.ffive.pos_system.dto.GUIBeautyService;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.validation.ProductCreateValidator;
import com.ffive.pos_system.util.EmployeeHelper;

import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;




@Service
@Slf4j
@RequiredArgsConstructor
public class BeautyServiceService {
    
    private final BeautyServiceRepository beautyServiceRepository;
    private final EmployeeRepository employeeRepository;
    private final BeautyServiceConverter beautyServiceConverter;


    public List<com.ffive.pos_system.model.BeautyService> listServicesByBusiness(UUID businessId) {
      return  beautyServiceRepository.findAllByBusiness(businessId);
        
    }
    public List<com.ffive.pos_system.model.BeautyService> getServiceByIdAndBusiness(UUID serviceId, UUID businessId) {
        return beautyServiceRepository.findByIdAndBusiness(serviceId, businessId);
        
    }

    public void createService(GUIBeautyService beautyService) {

        

        //beautyServiceRepository.save(beautyService);
    }

    public BeautyService updateService(UUID serviceId, GUIBeautyService guiObj){


        try {
             BeautyService found = beautyServiceRepository.findById(serviceId).orElse(null);
        if (!found.getName().equals(guiObj.getName())){
               found.setName(guiObj.getName());
        }
         if (found.getDuration() != guiObj.getDuration()){
              found.setDuration(guiObj.getDuration());
        }
         if (found.getOpensAt() == null || !found.getOpensAt().equals(guiObj.getOpensAt())) {
            found.setOpensAt(guiObj.getOpensAt());
        }
        if (found.getClosesAt() == null || !found.getClosesAt().equals(guiObj.getClosesAt())) {
            found.setClosesAt(guiObj.getClosesAt());
        }
        
        beautyServiceRepository.save(found);
        return found;

        } catch (Exception e) {
            throw new ValidationException(MODIFYING_NON_EXISTENT_ENTITY);
        }
       
    }

    public void deleteServiceById(UUID serviceId){
        beautyServiceRepository.deleteById(serviceId);
    }

}
