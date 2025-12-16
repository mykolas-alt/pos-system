package com.ffive.pos_system.service;

import static com.ffive.pos_system.service.validation.ValidationMessageConstants.MODIFYING_NON_EXISTENT_ENTITY;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.ArrayList;

import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.POSService;
import com.ffive.pos_system.model.Reservation;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.repository.ReservationRepository;
import com.ffive.pos_system.dto.GUIReservation;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.converter.ReservationConverter;
import com.ffive.pos_system.service.validation.ValidationException;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;



@Service
@Slf4j
@RequiredArgsConstructor
public class ReservationService {
    
    private final ReservationRepository reservationRepository;
    private final EmployeeRepository employeeRepository;
    private final ReservationConverter reservationConverter;


    public List<GUIReservation> listServicesByBusiness(POSUserDetails userDetails){
        Business business = userDetails.getUser().getEmployee().getBusiness();
        List<GUIReservation> result = new ArrayList<GUIReservation>();  

        List<Reservation> found = reservationRepository.findAllByBusinessId(business.getId()).stream().toList();
        for (Reservation res : found){
            GUIReservation guiObj = reservationConverter.convertToGUI(res);
            result.add(guiObj);
        }
        return result;
    }

    public void createReservation(POSUserDetails userDetails, GUIReservation reservation, UUID employeeId) {

        Reservation newService = reservationConverter.convertToEntity(reservation);
        Business business = userDetails.getUser().getEmployee().getBusiness();
        newService.setBusiness(business);
        //newService.employeeId = employeeRepository.findByUserId(employeeId).get();
        reservationRepository.save(newService);

    }

    public void deleteReservationById(POSUserDetails userDetails , UUID reservationId){
        reservationRepository.deleteById(reservationId);
    }

    public void updateReservation(POSUserDetails userDetails , UUID reservationId, GUIReservation guiObj){

        if (reservationId == null || guiObj == null) {
            throw new ValidationException(MODIFYING_NON_EXISTENT_ENTITY);
        }

        Reservation found = reservationRepository.findById(reservationId).orElseThrow(() -> new ValidationException("Service not found"));
        
            if (found.getCustomerName() == null) {
                log.warn("Customer name is null for reservaion ID: {}", reservationId);
            }
            if (!found.getCustomerName().equals(guiObj.getCustomerName())){
               found.setCustomerName(guiObj.getCustomerName());
        }
         if (found.getCustomerPhone() != guiObj.getCustomerPhone()){
              found.setCustomerPhone(guiObj.getCustomerPhone());
        }
         if (found.getApointmentTime() == null || !found.getApointmentTime().equals(guiObj.getApointmentTime())) {
            found.setApointmentTime(guiObj.getApointmentTime());
         }
         if (found.getStatus() == null || !found.getStatus().equals(guiObj.getStatus())) {
            found.setStatus(guiObj.getStatus());
         }
         if (found.getClosedAt() == null || !found.getClosedAt().equals(guiObj.getClosedAt())) {
            found.setClosedAt(guiObj.getClosedAt());
         }
         if (found.getCreatedAt() == null || !found.getCreatedAt().equals(guiObj.getCreatedAt())) {
            found.setCreatedAt(guiObj.getCreatedAt());
        
         }

        if (found != null)
        reservationRepository.save(found);
         
      
    }


    public GUIReservation getReservationById(POSUserDetails userDetails , UUID reservationId) {

        Reservation found = reservationRepository.findByReservationId(reservationId);
        return reservationConverter.convertToGUI(found);
    }
}
