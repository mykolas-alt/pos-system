package com.ffive.pos_system.controller;

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
import com.ffive.pos_system.service.ReservationService;
import com.ffive.pos_system.security.POSUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import lombok.RequiredArgsConstructor;



@RestController
@RequestMapping("/resetvations")
@Tag(name = "Reservation", description = "CRUD operations for beauty service reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @Operation(summary = "List all reservations for a given business")
    @GetMapping
    public ResponseEntity<List<GUIReservation>> listByBusiness(
        @AuthenticationPrincipal POSUserDetails userDetails){
        List<GUIReservation> result = reservationService.listServicesByBusiness(userDetails);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Create a new reservation service")
    @PostMapping
    public ResponseEntity<Void> createReservation(
        @AuthenticationPrincipal POSUserDetails userDetails,
        @PathVariable UUID employeeId,
        @RequestBody GUIReservation reservation) {

        reservationService.createReservation(userDetails, reservation, employeeId);

        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get a reservation details")
    @GetMapping("/{reservationId}")
    public GUIReservation getReservationById(
        @AuthenticationPrincipal POSUserDetails userDetails,
        @PathVariable UUID reservationId){
        
      
        return reservationService.getReservationById(userDetails, reservationId);
    }

    @Operation(summary = "Delete a reservation by its ID")
    @DeleteMapping("/{reservationId}")
    public ResponseEntity<Void> deleteReservationById(
        @AuthenticationPrincipal POSUserDetails userDetails,
        @PathVariable UUID reservationId){

        reservationService.deleteReservationById(userDetails, reservationId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Update a reservation by its ID")
    @PutMapping("/{reservationId}")
    public ResponseEntity<Void> updateReservation(
        @AuthenticationPrincipal POSUserDetails userDetails,
        @PathVariable UUID reservationId,
        @RequestBody GUIReservation guiObj){
        
        reservationService.updateReservation(userDetails, reservationId, guiObj);
        return ResponseEntity.ok().build();
    }

}
