package com.ffive.pos_system.converter;

import com.ffive.pos_system.dto.GUIReservation;
import com.ffive.pos_system.model.Reservation;
import org.springframework.stereotype.Component;

@Component
public class ReservationConverter {
    


    public GUIReservation convertToGUI(Reservation reservation) {
        return GUIReservation.builder()
        .id(reservation.getId())
        .businessId(reservation.getBusiness().getId())
        .apointmentTime(reservation.getApointmentTime())
        .customerName(reservation.getCustomerName())
        .status(reservation.getStatus())
        .createdAt(reservation.getCreatedAt())
        .closedAt(reservation.getClosedAt())
        .build();
    }

    public Reservation convertToEntity(GUIReservation guiReservation) {
        Reservation reservation = new Reservation();
        reservation.setId(guiReservation.getId());
        reservation.setApointmentTime(guiReservation.getApointmentTime());
        reservation.setCustomerName(guiReservation.getCustomerName());
        reservation.setStatus(guiReservation.getStatus());
        reservation.setCreatedAt(guiReservation.getCreatedAt());
        reservation.setClosedAt(guiReservation.getClosedAt());
        return reservation;
    }
}
