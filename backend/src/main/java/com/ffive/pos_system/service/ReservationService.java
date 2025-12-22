package com.ffive.pos_system.service;

import static com.ffive.pos_system.service.validation.ValidationMessageConstants.MODIFYING_NON_EXISTENT_ENTITY;

import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;

import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.Reservation;
import com.ffive.pos_system.model.ReservationStatus;
import com.ffive.pos_system.model.POSService;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.repository.ReservationRepository;
import com.ffive.pos_system.repository.ServiceRepository;
import com.ffive.pos_system.repository.ReservationTaxRepository;
import com.ffive.pos_system.repository.DiscountRepository;
import com.ffive.pos_system.repository.TaxRepository;
import com.ffive.pos_system.repository.ReservationDiscountRepository;
import com.ffive.pos_system.dto.ReservationRequest;
import com.ffive.pos_system.dto.ReservationResponse;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.converter.ReservationConverter;
import com.ffive.pos_system.handler.ReservationStateHandler;
import com.ffive.pos_system.service.validation.ValidationException;
import com.ffive.pos_system.dto.TaxRequest;
import com.ffive.pos_system.dto.DiscountRequest;
import com.ffive.pos_system.model.ReservationTax;
import com.ffive.pos_system.model.ReservationDiscount;
import com.ffive.pos_system.model.Tax;
import com.ffive.pos_system.model.Discount;
import jakarta.validation.Valid;

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
    private final ReservationTaxRepository reservationTaxRepository;
    private final TaxRepository taxRepository;
    private final DiscountRepository discountRepository;
    private final ReservationDiscountRepository reservationDiscountRepository;
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
        newReservation.setTotalAmount(BigDecimal.ZERO);
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
    public void addTaxToReservation(POSUserDetails userDetails, @Valid UUID reservationId, 
            @Valid TaxRequest reservationTaxReq){
         Reservation reservation = reservationRepository.findByReservationId(reservationId).orElseThrow(() -> new ValidationException("Reservation not found"));
        
        Tax tax = taxRepository.findById(reservationTaxReq.getId())
                .orElseThrow(() -> new ValidationException("Tax not found"));
        ReservationTax reservationTax = ReservationTax.builder()
                .reservation(reservation)
                .tax(tax)
                .build();

        reservationTaxRepository.save(reservationTax);
    }

    public void removeTaxFromReservation(POSUserDetails userDetails, @Valid UUID reservationId, 
            @Valid UUID reservationTaxId){
        
        Reservation reservation = reservationRepository.findByReservationId(reservationId).orElseThrow(() -> new ValidationException("Reservation not found"));

       ReservationTax reservationTax = reservationTaxRepository.findById(reservationTaxId)
                .orElseThrow(() -> new ValidationException("Tax not found"));

        if (!reservationTax.getReservation().getId().equals(reservation.getId())) {
            throw new ValidationException("Service tax does not belong to the specified service");
        }

        reservationTaxRepository.delete(reservationTax);
    }

    public void addDiscountToReservation(POSUserDetails userDetails, @Valid UUID reservationId, 
            @Valid DiscountRequest reservationDiscount){

     
         Reservation reservation = reservationRepository.findByReservationId(reservationId).orElseThrow(() -> new ValidationException("Reservation not found"));
        
         Discount  discount = discountRepository.findById(reservationDiscount.getId())
                .orElseThrow(() -> new ValidationException("Tax not found"));
        ReservationDiscount reservationDiscountEntity = ReservationDiscount.builder()
                .reservation(reservation)
                .discount(discount)
                .expiresAt(reservationDiscount.getExpiresAt())
                .build();

                reservationDiscountRepository.save(reservationDiscountEntity);     
        }

        public void removeDiscountFromReservation(POSUserDetails userDetails, @Valid UUID reservationId, 
            @Valid UUID reservationDiscountId){

           
         Reservation reservation = reservationRepository.findByReservationId(reservationId).orElseThrow(() -> new ValidationException("Reservation not found"));

            ReservationDiscount reservationDiscount = reservationDiscountRepository.findById(reservationDiscountId)
                .orElseThrow(() -> new ValidationException("Tax not found"));

            if (!reservationDiscount.getReservation().getId().equals(reservation.getId())) {
                throw new ValidationException("Service discount does not belong to the specified service");
            }



            reservationDiscountRepository.delete(reservationDiscount);
        }

}
