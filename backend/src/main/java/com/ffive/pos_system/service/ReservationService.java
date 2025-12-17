package com.ffive.pos_system.service;

import static com.ffive.pos_system.service.validation.ValidationMessageConstants.MODIFYING_NON_EXISTENT_ENTITY;

import java.util.List;
import java.util.UUID;
import java.util.ArrayList;

import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.Reservation;
import com.ffive.pos_system.model.OrderStatus;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.repository.ReservationRepository;
import com.ffive.pos_system.service.POSServiceService;
import com.ffive.pos_system.dto.ReservationRequest;
import com.ffive.pos_system.dto.ReservationResponse;
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
    private final POSServiceService posServiceService;


    public List<ReservationResponse> listServicesByBusiness(POSUserDetails userDetails){
        Business business = userDetails.getUser().getEmployee().getBusiness();
        List<ReservationResponse> result = new ArrayList<ReservationResponse>();  

        List<Reservation> found = reservationRepository.findAllByBusinessId(business.getId()).stream().toList();
        for (Reservation res : found){
            ReservationResponse guiObj = reservationConverter.convertToGUI(res);
            result.add(guiObj);
        }
        return result;
    }

    public void createReservation(POSUserDetails userDetails, ReservationRequest reservation) {

        Reservation newService = reservationConverter.convertToEntity(reservation);
        Business business = userDetails.getUser().getEmployee().getBusiness();
        newService.setBusiness(business);
        newService.setEmployee(employeeRepository.findById(reservation.getEmployeeId()).get());
        newService.setCreatedAt(java.time.LocalDateTime.now());
        newService.setApointmentTime(reservation.getApointmentTime());
        newService.setCustomerName(reservation.getCustomerName());
        newService.setCustomerPhone(reservation.getCustomerPhone());
        newService.setService(posServiceService.getServiceEntityByIdAndBusiness(userDetails, reservation.getServiceId()));
        newService.setStatus(reservation.getStatus());
        newService.setClosedAt(reservation.getClosedAt());
        newService.setCreatedAt(reservation.getCreatedAt());
        reservationRepository.save(newService);

    }

    public void deleteReservationById(POSUserDetails userDetails , UUID reservationId){
        Reservation found = reservationRepository.findByReservationId(reservationId).orElseThrow(() -> new ValidationException("Reservation not found"));
        found.setStatus(OrderStatus.CANCELLED);
        reservationRepository.save(found);
    }

    public void updateReservation(POSUserDetails userDetails , UUID reservationId, ReservationRequest guiObj){

        if (reservationId == null || guiObj == null) {
            throw new ValidationException(MODIFYING_NON_EXISTENT_ENTITY);
        }

        Reservation found = reservationRepository.findByReservationId(reservationId).orElseThrow(() -> new ValidationException("Reservation not found"));
        
            if (found.getCustomerName() == null) {
                log.warn("Customer name is null for reservaion ID: {}", reservationId);
            }
            if (!found.getCustomerName().equals(guiObj.getCustomerName())){
               found.setCustomerName(guiObj.getCustomerName());
        }
         if (!found.getCustomerPhone().equals(guiObj.getCustomerPhone())){
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


    public ReservationResponse getReservationById(POSUserDetails userDetails , UUID reservationId) {

        Reservation found = reservationRepository.findByReservationId(reservationId).orElseThrow(() -> new ValidationException("Reservation not found"));
        return reservationConverter.convertToGUI(found);
    }
}
