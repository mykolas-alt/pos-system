package com.ffive.pos_system.service;


import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import com.ffive.pos_system.model.POSService;
import com.ffive.pos_system.dto.ServiceRequest;
import com.ffive.pos_system.dto.ServiceResponse;
import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.repository.ServiceRepository;
import com.ffive.pos_system.repository.ServiceTaxRepository;
import com.ffive.pos_system.repository.TaxRepository;
import com.ffive.pos_system.repository.DiscountRepository;
import com.ffive.pos_system.repository.ServiceDiscountRepository;
import com.ffive.pos_system.service.validation.ValidationException;
import com.ffive.pos_system.converter.ServiceConverter;
import com.ffive.pos_system.dto.ServiceRequest;
import com.ffive.pos_system.dto.ServiceResponse;
import com.ffive.pos_system.dto.DiscountRequest;
import com.ffive.pos_system.dto.TaxRequest;
import com.ffive.pos_system.model.ServiceTax;
import com.ffive.pos_system.model.ServiceDiscount;
import com.ffive.pos_system.model.Tax;
import com.ffive.pos_system.model.Discount;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;




@Service
@Slf4j
@RequiredArgsConstructor
public class POSServiceService {
    
    private final ServiceRepository serviceRepository;
    private final EmployeeRepository employeeRepository;
    private final ServiceTaxRepository serviceTaxRepository;
    private final TaxRepository taxRepository;
    private final DiscountRepository discountRepository;
    private final ServiceDiscountRepository serviceDiscountRepository;
    private final ServiceConverter serviceConverter;


    public List<ServiceResponse> listServicesByBusiness(POSUserDetails userDetails) {
        return serviceRepository.findAllByBusiness(userDetails.getUser().getEmployee().getBusiness().getId())
                                .stream()
                                .map(serviceConverter::convertToGUI)
                                .toList();
        
        
        
    }
    public POSService getServiceEntityByIdAndBusiness(POSUserDetails userDetails, UUID serviceId) {
    Business business = userDetails.getUser().getEmployee().getBusiness();

    return serviceRepository
        .findByIdAndBusiness(serviceId, business.getId())
        .orElseThrow(() -> new ValidationException("Service not found"));
    }

    public ServiceResponse getServiceByIdAndBusiness(POSUserDetails userDetails, UUID serviceId) {
    POSService service = getServiceEntityByIdAndBusiness(userDetails, serviceId);
    return serviceConverter.convertToGUI(service);
    }
    
    public void createService(POSUserDetails userDetails, ServiceRequest service) {
       

        POSService newService = new POSService();
        newService.setBusiness(userDetails.getUser().getEmployee().getBusiness());
        newService.setSpecialist(
            employeeRepository.findById(service.getSpecialistId())
            .orElseThrow(() -> new ValidationException("Specialist not found"))
        );
        newService.setName(service.getName());
        newService.setDuration(service.getDuration());
        newService.setOpensAt(service.getOpensAt());
        newService.setClosesAt(service.getClosesAt());
        newService.setIsActive(true);
        newService.setPrice(service.getPrice());

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

    public void addTaxToService(POSUserDetails userDetails, @Valid UUID serviceId, 
            @Valid TaxRequest serviceTaxRequest){
        POSService service = getServiceEntityByIdAndBusiness(userDetails, serviceId);
                
        Tax tax = taxRepository.findById(serviceTaxRequest.getId())
                .orElseThrow(() -> new ValidationException("Tax not found"));
        ServiceTax serviceTax = ServiceTax.builder()
                .service(service)
                .tax(tax)
                .build();

        serviceTaxRepository.save(serviceTax);
    }

    public void removeTaxFromService(POSUserDetails userDetails, @Valid UUID serviceId, 
            @Valid UUID serviceTaxId){
        POSService service = getServiceEntityByIdAndBusiness(userDetails, serviceId);
        
        ServiceTax serviceTax = serviceTaxRepository.findById(serviceTaxId)
                .orElseThrow(() -> new ValidationException("Tax not found"));

        if (!serviceTax.getService().getId().equals(service.getId())) {
            throw new ValidationException("Service tax does not belong to the specified service");
        }

        serviceTaxRepository.delete(serviceTax);
    }

    public void addDiscountToService(POSUserDetails userDetails, @Valid UUID serviceId, 
            @Valid DiscountRequest serviceDiscount){

        POSService service = getServiceEntityByIdAndBusiness(userDetails, serviceId);
        
        var  discount = discountRepository.findById(serviceDiscount.getId())
                .orElseThrow(() -> new ValidationException("Tax not found"));
        var serviceDiscountEntity = ServiceDiscount.builder()
                .service(service)
                .discount(discount)
                .expiresAt(serviceDiscount.getExpiresAt())
                .build();

                serviceDiscountRepository.save(serviceDiscountEntity);     
        }

        public void removeDiscountFromService(POSUserDetails userDetails, @Valid UUID serviceId, 
            @Valid UUID serviceDiscountId){

            POSService service = getServiceEntityByIdAndBusiness(userDetails, serviceId);

            ServiceDiscount serviceDiscount = serviceDiscountRepository.findById(serviceDiscountId)
                .orElseThrow(() -> new ValidationException("Tax not found"));

            if (!serviceDiscount.getService().getId().equals(service.getId())) {
                throw new ValidationException("Service discount does not belong to the specified service");
            }



            serviceDiscountRepository.delete(serviceDiscount);
        }
           
}   
