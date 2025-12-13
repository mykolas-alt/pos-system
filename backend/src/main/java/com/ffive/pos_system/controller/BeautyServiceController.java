package com.ffive.pos_system.controller;

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
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;

import com.ffive.pos_system.dto.GUIBeautyService;
import com.ffive.pos_system.dto.GUIReservation;
import com.ffive.pos_system.model.BeautyService;
import com.ffive.pos_system.model.OrderStatus;
import com.ffive.pos_system.model.Reservation;
import com.ffive.pos_system.repository.BeautyServiceRepository;
import com.ffive.pos_system.repository.ReservationRepository;
import com.ffive.pos_system.service.BeautyServiceService;
import com.ffive.pos_system.converter.BeautyServiceConverter;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/services")
@Tag(name = "Services", description = "CRUD operations for beauty services")
@RequiredArgsConstructor
public class BeautyServiceController {

	private final BeautyServiceRepository beautyServiceRepository;
	private final BeautyServiceService beautyServiceService;
	// TODO: Inject ReservationRepository
	 private final ReservationRepository reservationRepository;
	 private final BeautyServiceConverter beautyServiceConverter;
	// TODO: Inject BusinessRepository / EmployeeRepository if needed for validation

	@Operation(summary = "List all beauty services for a given business")
	@GetMapping
		public ResponseEntity<List<GUIBeautyService>> listByBusiness(@RequestParam UUID businessId){
			List<GUIBeautyService> result = beautyServiceRepository
				.findAllByBusiness(businessId)
				.stream()
				.map(beautyServiceConverter::convertToGUI)
				.toList();
			
			return ResponseEntity.ok(result);
	}

	@Operation(summary = "Create a new beauty service")
	@PostMapping
	public ResponseEntity<Void> createService(
			@RequestBody BeautyService beautyService) {
		
		BeautyService savedService = beautyServiceRepository.save(beautyService);
		
		return ResponseEntity.ok().build();
	}
	@Operation(summary = "Get a beauty service by its ID")
	@GetMapping("/{serviceId}")
	public ResponseEntity<GUIBeautyService> getServiceById(
			@PathVariable UUID serviceId) {
		
		BeautyService beautyService = beautyServiceRepository.findByServiceId(serviceId);
		
		GUIBeautyService guiBeautyService = beautyServiceConverter.convertToGUI(beautyService);
		
		return ResponseEntity.ok(guiBeautyService);
	}

	/*
	PUT 
	DELETE
	*/
	@Operation(summary = "Update an existing beauty service")
	@PutMapping("/{serviceId}")
	public ResponseEntity<GUIBeautyService> updateService(
			@PathVariable UUID serviceId,
			@RequestBody GUIBeautyService guiBeautyService) {
			
				beautyServiceService.updateService(serviceId, guiBeautyService);
			
			return ResponseEntity.ok().build();
			}

	@Operation(summary = "Delete a beauty service by its ID")		
	@DeleteMapping("/{serviceId}")
	public ResponseEntity<Void> deleteService(
			@PathVariable UUID serviceId) {
		
		beautyServiceService.deleteServiceById(serviceId);
		
		return ResponseEntity.ok().build();
	}
}

