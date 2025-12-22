package com.ffive.pos_system.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
import jakarta.validation.Valid;

import com.ffive.pos_system.dto.ReservationRequest;
import com.ffive.pos_system.dto.ReservationResponse;
import com.ffive.pos_system.dto.DiscountRequest;
import com.ffive.pos_system.dto.TaxRequest;
import com.ffive.pos_system.service.ReservationService;
import com.ffive.pos_system.security.POSUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import lombok.RequiredArgsConstructor;



@RestController
@RequestMapping("/reservations")
@Tag(name = "Reservation", description = "CRUD operations for service reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @Operation(summary = "List all reservations for a given business")
    @GetMapping
    public ResponseEntity<List<ReservationResponse>> listByBusiness(
        @AuthenticationPrincipal POSUserDetails userDetails){
        List<ReservationResponse> result = reservationService.listReservationsByBusiness(userDetails);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Create a new reservation for a service")
    @PostMapping
    public ResponseEntity<Void> createReservation(
        @AuthenticationPrincipal POSUserDetails userDetails,
        @RequestBody ReservationRequest reservation) {

        reservationService.createReservation(userDetails, reservation);

        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get a specific reservation details")
    @GetMapping("/{reservationId}")
    public ReservationResponse getReservationById(
        @AuthenticationPrincipal POSUserDetails userDetails,
        @PathVariable UUID reservationId){
        
      
        return reservationService.getReservationById(userDetails, reservationId);
    }

    @Operation(summary = "Complete a specific reservation by its ID")
    @PostMapping("/{reservationId}")
    public ResponseEntity<Void> completeReservation(
        @AuthenticationPrincipal POSUserDetails userDetails,
        @PathVariable UUID reservationId){

        reservationService.completeReservation(userDetails, reservationId);
        return ResponseEntity.ok().build();
    }


    @Operation(summary = "Delete a specific reservation by its ID")
    @DeleteMapping("/{reservationId}")
    public ResponseEntity<Void> deleteReservationById(
        @AuthenticationPrincipal POSUserDetails userDetails,
        @PathVariable UUID reservationId){

        reservationService.deleteReservationById(userDetails, reservationId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Update a specific reservation by its ID")
    @PutMapping("/{reservationId}")
    public ResponseEntity<Void> updateReservation(
        @AuthenticationPrincipal POSUserDetails userDetails,
        @PathVariable UUID reservationId,
        @RequestBody ReservationRequest guiObj){
        
        reservationService.updateReservation(userDetails, reservationId, guiObj);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Remove a tax from a reservation")
    @DeleteMapping("/{reservationId}/tax/{reservationTaxId}")
    public ResponseEntity<Void> removeTax(
        @AuthenticationPrincipal POSUserDetails userDetails,
        @Valid @PathVariable UUID reservationId,
        @Valid @PathVariable UUID reservationTaxId) {
        
        reservationService.removeTaxFromReservation(userDetails, reservationId, reservationTaxId);
        return ResponseEntity.ok().build();
    }
 
    @Operation(summary = "Remove a discount from a reservation")
    @DeleteMapping("/{reservationId}/discount/{reservationDiscountId}")
    public ResponseEntity<Void> removeDiscount(
        @AuthenticationPrincipal POSUserDetails userDetails,
        @Valid @PathVariable UUID reservationId,
        @Valid @PathVariable UUID reservationDiscountId) {
        
        reservationService.removeDiscountFromReservation(userDetails, reservationId, reservationDiscountId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Add discount to a reservation")
    @PostMapping("/{reservationId}/discount")
    public ResponseEntity<Void> addDiscount(
        @AuthenticationPrincipal POSUserDetails userDetails,
        @Valid @PathVariable UUID reservationId,
        @Valid @RequestBody DiscountRequest addDiscountRequest) {
        
        reservationService.addDiscountToReservation(userDetails, reservationId, addDiscountRequest);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Add tax to a reservation")
    @PostMapping("/{reservationId}/tax")
    public ResponseEntity<Void> addTax(
        @AuthenticationPrincipal POSUserDetails userDetails,
        @Valid @PathVariable UUID reservationId,
        @Valid @RequestBody TaxRequest addTaxRequest) {
        
        reservationService.addTaxToReservation(userDetails, reservationId, addTaxRequest);
        return ResponseEntity.ok().build();
    }

}
