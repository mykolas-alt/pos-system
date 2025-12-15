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
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import com.ffive.pos_system.dto.ServiceResponse;
import com.ffive.pos_system.dto.ServiceRequest;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.POSServiceService;
import com.ffive.pos_system.converter.ServiceConverter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/service")
@Tag(name = "Services", description = "CRUD operations for beauty services")
@RequiredArgsConstructor
public class BeautyServiceController {

	private final POSServiceService beautyServiceService;
	private final ServiceConverter beautyServiceConverter;

	@Operation(summary = "List all beauty services for a given business")
	@GetMapping
		public ResponseEntity<List<ServiceResponse>> listByBusiness(
			@AuthenticationPrincipal POSUserDetails userDetails){
			List<ServiceResponse> result = beautyServiceService.listServicesByBusiness(userDetails);
			return ResponseEntity.ok(result);
	}

	@Operation(summary = "Create a new beauty service")
	@PostMapping
	public String createService(@AuthenticationPrincipal POSUserDetails userDetails,
			@PathVariable UUID specialistId,
			@RequestBody ServiceRequest beautyService) {
		
		beautyServiceService.createService(userDetails, specialistId, beautyService);
		
		return " Service created";
	}
	@Operation(summary = "Get a beauty service by its ID")
	@GetMapping("/{serviceId}")
	public ServiceResponse getServiceById(
		@AuthenticationPrincipal POSUserDetails userDetails,
		@PathVariable UUID serviceId) {
		
		return beautyServiceService.getServiceByIdAndBusiness(userDetails, serviceId);
	}
	@Operation(summary = "Update an existing beauty service")
	@PutMapping("/{serviceId}")
	public String updateService(@AuthenticationPrincipal POSUserDetails userDetails,
			@PathVariable UUID serviceId,
			@RequestBody ServiceRequest guiBeautyService) {
			
				beautyServiceService.updateService(userDetails, serviceId, guiBeautyService);
			
			return " Service updated";
			}

	@Operation(summary = "Delete a beauty service by its ID")		
	@DeleteMapping("/{serviceId}")
	public ResponseEntity<Void> deleteService(
		@AuthenticationPrincipal POSUserDetails userDetails,
		@PathVariable UUID serviceId) {
		beautyServiceService.deleteService(userDetails, serviceId);
		
		return ResponseEntity.ok().build();
	}
}

