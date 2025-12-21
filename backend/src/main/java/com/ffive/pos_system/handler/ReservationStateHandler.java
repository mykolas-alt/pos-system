package com.ffive.pos_system.handler;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.ReservationStatus;
import com.ffive.pos_system.model.Reservation;
import com.ffive.pos_system.model.OrderItem;
import com.ffive.pos_system.model.OrderStatus;
import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.repository.ReservationRepository;
import com.ffive.pos_system.repository.ServiceRepository;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.service.validation.ValidationException;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReservationStateHandler {

    private final ReservationRepository reservationRepository;
    private final ServiceRepository serviceRepository;
    private final EmployeeRepository employeeRepository;

    private void validateReservation(Reservation reservation, UUID businessId) {
        if (!Objects.equals(reservation.getBusiness().getId(), businessId)) {
            throw new ValidationException("Reservation does not belong to the employee's business");
        }
    }

    private void validateReservationStatus(Reservation reservation){
        if (reservation.getStatus()!= ReservationStatus.OPEN){
            throw new ValidationException("Only open reservations and inprogress can be completed");
        }
    }

    @Transactional
    public void completeReservation(Employee employee, Reservation reservation) {
      
        validateReservation(reservation, employee.getBusiness().getId());
        validateReservationStatus(reservation);
        reservation.setStatus(ReservationStatus.IN_PROGRESS);
        reservationRepository.save(reservation);

    }


}