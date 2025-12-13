package com.ffive.pos_system.service;

import static com.ffive.pos_system.service.validation.ValidationMessageConstants.MODIFYING_NON_EXISTENT_ENTITY;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.ffive.pos_system.dto.GUIProduct;
import com.ffive.pos_system.dto.GUIBeautyService;
import com.ffive.pos_system.dto.GUIReservation;
import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.BeautyService;
import com.ffive.pos_system.model.Reservation;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.POSUser;
import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.repository.ProductRepository;
import com.ffive.pos_system.repository.BeautyServiceRepository;
import com.ffive.pos_system.repository.ReservationRepository;
import com.ffive.pos_system.converter.BeautyServiceConverter;
import com.ffive.pos_system.dto.GUIBeautyService;
import com.ffive.pos_system.dto.GUIReservation;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.validation.ProductCreateValidator;
import com.ffive.pos_system.util.EmployeeHelper;

import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;



@Service
@Slf4j
@RequiredArgsConstructor
public class ReservationService {
    
    private final ReservationRepository reservationRepository;
    private final EmployeeRepository employeeRepository;
    //private final ReservationConverter beautyServiceConverter;


    public List<Reservation> listServicesByBusiness(UUID businessId) {
      return  reservationRepository.findAllByBusinessId(businessId);
        
    }

    public void createReservation(GUIReservation reservation) {

        // Reservation newService = beautyServiceConverter.convertToEntity(reservation);
        // need to fetch employees by name or id to set in reservation
        // reservationRepository.save(reservation);

        //beautyServiceRepository.save(beautyService);
    }

    public void deleteReservationById(UUID reservationId){
        reservationRepository.deleteById(reservationId);
    }

    public Reservation updateReservation(UUID reservationId, GUIReservation guiObj){
        Optional<Reservation> existingReservationOpt = reservationRepository.findById(reservationId);
        if (existingReservationOpt.isEmpty()) {
            throw new ValidationException(MODIFYING_NON_EXISTENT_ENTITY);
        }

        try {
            Reservation found = existingReservationOpt.get();

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
        reservationRepository.save(found);
        return found;
         
        } catch (Exception e) {
            log.error("Error updating reservation: {}", e.getMessage());
            throw e;
        }
    }


    public Optional<Reservation> getReservationById(UUID reservationId) {
        return reservationRepository.findById(reservationId);
    }
}
