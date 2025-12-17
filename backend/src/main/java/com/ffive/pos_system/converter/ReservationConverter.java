package com.ffive.pos_system.converter;

import com.ffive.pos_system.dto.ReservationRequest;
import com.ffive.pos_system.dto.ReservationResponse;
import com.ffive.pos_system.model.Reservation;
import org.springframework.stereotype.Component;

@Component
public class ReservationConverter {
    


    public ReservationResponse convertToGUI(Reservation reservation) {
        return ReservationResponse.builder()
        .id(reservation.getId())
        .employeeId(reservation.getEmployee().getId())
        .serviceId(reservation.getService().getId())
        .apointmentTime(reservation.getApointmentTime())
        .customerName(reservation.getCustomerName())
        .createdAt(reservation.getCreatedAt())
        .status(reservation.getStatus())
        .closedAt(reservation.getClosedAt())
        .build();
    }

    public Reservation convertToEntity(ReservationRequest guiReservation) {
        Reservation reservation = new Reservation();
        reservation.setApointmentTime(guiReservation.getApointmentTime());
        reservation.setCustomerName(guiReservation.getCustomerName());
        reservation.setStatus(guiReservation.getStatus());
        reservation.setCreatedAt(guiReservation.getCreatedAt());
        reservation.setClosedAt(guiReservation.getClosedAt());
        return reservation;
    }
}
