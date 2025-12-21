package com.ffive.pos_system.service;

import static com.ffive.pos_system.service.validation.ValidationMessageConstants.MODIFYING_NON_EXISTENT_ENTITY;

import java.util.List;
import java.util.UUID;

import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.Reservation;
import com.ffive.pos_system.model.ReservationStatus;
import com.ffive.pos_system.model.POSService;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.repository.ReservationRepository;
import com.ffive.pos_system.repository.ServiceRepository;
import com.ffive.pos_system.dto.ReservationRequest;
import com.ffive.pos_system.dto.ReservationResponse;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.converter.ReservationConverter;
import com.ffive.pos_system.handler.ReservationStateHandler;
import com.ffive.pos_system.service.validation.ValidationException;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;



@Service
@Slf4j
@RequiredArgsConstructor
public class ReservationService {
    
    private final ReservationRepository reservationRepository;
    private final ServiceRepository serviceRepository;
    private final EmployeeRepository employeeRepository;
    private final ReservationConverter reservationConverter;
    private final POSServiceService posServiceService;
    private final ReservationStateHandler reservationStateHandler;


    public List<ReservationResponse> listReservationsByBusiness(POSUserDetails userDetails){
        return reservationRepository.findAllByBusinessId(userDetails.getUser().getEmployee().getBusiness().getId())
        .stream()
        .map(reservationConverter::convertToGUI)
        .toList();
    }

    public void completeReservation(POSUserDetails userDetails, UUID reservationId){
        Reservation reservation = reservationRepository.findById(reservationId).orElseThrow(() -> new ValidationException("Reservation not found"));
        reservationStateHandler.completeReservation(userDetails.getUser().getEmployee(), reservation);
    }
    public void createReservation(POSUserDetails userDetails, ReservationRequest reservation) {

        Reservation newReservation = reservationConverter.convertToEntity(reservation);
        Business business = userDetails.getUser().getEmployee().getBusiness();
        newReservation.setBusiness(business);
        newReservation.setCreatedAt(java.time.LocalDateTime.now());
        newReservation.setApointmentTime(reservation.getApointmentTime());
        newReservation.setCustomerName(reservation.getCustomerName());
        newReservation.setCustomerPhone(reservation.getCustomerPhone());
        newReservation.setService(posServiceService.getServiceEntityByIdAndBusiness(userDetails, reservation.getServiceId()));
        newReservation.setTotalAmount(newReservation.getService().getPrice());
        newReservation.setStatus(reservation.getStatus());
        newReservation.setClosedAt(reservation.getClosedAt());
        newReservation.setCreatedAt(reservation.getCreatedAt());
        reservationRepository.save(newReservation);

    }

    public void deleteReservationById(POSUserDetails userDetails , UUID reservationId){
        Reservation found = reservationRepository.findByReservationId(reservationId).orElseThrow(() -> new ValidationException("Reservation not found"));
        found.setStatus(ReservationStatus.CANCELLED);
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

        reservationRepository.save(found);
         
      
    }


    public ReservationResponse getReservationById(POSUserDetails userDetails , UUID reservationId) {

        Reservation found = reservationRepository.findByReservationId(reservationId).orElseThrow(() -> new ValidationException("Reservation not found"));
        return reservationConverter.convertToGUI(found);
    }
}
