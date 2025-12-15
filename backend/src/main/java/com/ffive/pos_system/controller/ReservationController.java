package com.ffive.pos_system.controller;

import java.util.List;
import java.util.UUID;


import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.ffive.pos_system.dto.GUIReservation;
import com.ffive.pos_system.dto.ServiceResponse;
import com.ffive.pos_system.dto.ServiceRequest;
import com.ffive.pos_system.repository.ReservationRepository;
import com.ffive.pos_system.model.Reservation;
import com.ffive.pos_system.service.ReservationService;
import com.ffive.pos_system.converter.ReservationConverter;

import lombok.RequiredArgsConstructor;



@RestController
@RequestMapping("/resetvations")
@Tag(name = "Reservation", description = "CRUD operations for beauty service reservations")
@RequiredArgsConstructor
public class ReservationController {

    
    private final ReservationRepository reservationRepository;
    private final ReservationService reservationService;
    private final ReservationConverter reservationConverter;

    @Operation(summary = "List all reservations for a given business")
    @GetMapping
    public ResponseEntity<List<GUIReservation>> listByBusiness(@RequestParam UUID businessId){
        List<GUIReservation> result = reservationService
            .listServicesByBusiness(businessId)
            .stream()
            .map(reservationConverter::convertToGUI)
            .toList();
        
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Create a new reservation service")
    @PostMapping
    public ResponseEntity<Void> createReservation(ResponseEntity<GUIReservation> reservation) {

        reservationService.createReservation(reservation.getBody());

        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get a reservation details")
    @GetMapping("/{reservationId}")
    public ResponseEntity<GUIReservation> getReservationById(@PathVariable UUID reservationId){
        
        Reservation reservation = reservationRepository.findByReservationId(reservationId);

        GUIReservation guiReservation = reservationConverter.convertToGUI(reservation);
        return ResponseEntity.ok(guiReservation);
    }

    @Operation(summary = "Delete a reservation by its ID")
    @DeleteMapping("/{reservationId}")
    public ResponseEntity<Void> deleteReservationById(@PathVariable UUID reservationId){
        reservationService.deleteReservationById(reservationId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Update a reservation by its ID")
    @PutMapping("/{reservationId}")
    public ResponseEntity<Void> updateReservation(@PathVariable UUID reservationId,
            @RequestBody GUIReservation guiObj){
        
        reservationService.updateReservation(reservationId, guiObj);
        return ResponseEntity.ok().build();
    }

}
