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
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;

import com.ffive.pos_system.dto.ServiceResponse;
import com.ffive.pos_system.dto.ServiceRequest;
import com.ffive.pos_system.dto.TaxRequest;
import com.ffive.pos_system.dto.DiscountRequest;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.POSServiceService;
import com.ffive.pos_system.converter.ServiceConverter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/service")
@Tag(name = "Services", description = "CRUD operations for business services")
@RequiredArgsConstructor
@PreAuthorize("@authorizationHelper.hasEmployee(authentication)")
public class ServiceController {

	private final POSServiceService serviceService;

	@Operation(summary = "List all services for a given business")
	@GetMapping
		public ResponseEntity<List<ServiceResponse>> listByBusiness(
			@AuthenticationPrincipal POSUserDetails userDetails){
			List<ServiceResponse> result = serviceService.listServicesByBusiness(userDetails);
			return ResponseEntity.ok(result);
	}

	@Operation(summary = "Create a new service")
	@PostMapping
	public String createService(
		@AuthenticationPrincipal POSUserDetails userDetails,
		@RequestBody ServiceRequest beautyService) {
		
		serviceService.createService(userDetails, beautyService);
		
		return " Service created";
	}
	@Operation(summary = "Get a service by its ID")
	@GetMapping("/{serviceId}")
	public ServiceResponse getServiceById(
		@AuthenticationPrincipal POSUserDetails userDetails,
		@PathVariable UUID serviceId) {
		
		return serviceService.getServiceByIdAndBusiness(userDetails, serviceId);
	}

	@Operation(summary = "Update an existing service")
	@PutMapping("/{serviceId}")
	public String updateService(
		@AuthenticationPrincipal POSUserDetails userDetails,
		@PathVariable UUID serviceId,
		@RequestBody ServiceRequest guiBeautyService) {
			
		serviceService.updateService(userDetails, serviceId, guiBeautyService);
			
		return " Service updated";
	}

	@Operation(summary = "Delete a service by its ID")		
	@DeleteMapping("/{serviceId}")
	public ResponseEntity<Void> deleteService(
		@AuthenticationPrincipal POSUserDetails userDetails,
		@PathVariable UUID serviceId) {

		serviceService.deleteService(userDetails, serviceId);
		return ResponseEntity.ok().build();
	}

	@Operation(summary = "Add discount to a service")
	@PostMapping("/{serviceId}/discount")
	public ResponseEntity<Void> addDiscount(
		@AuthenticationPrincipal POSUserDetails userDetails,
		@Valid @PathVariable UUID serviceId,
		@Valid @RequestBody DiscountRequest addDiscountRequest) {
		
		serviceService.addDiscountToService(userDetails, serviceId, addDiscountRequest);
		return ResponseEntity.ok().build();
	}

	@Operation(summary = "Remove a discount from a service")
	@DeleteMapping("/{serviceId}/discount/{serviceDiscountId}")
	public ResponseEntity<Void> removeDiscount(
		@AuthenticationPrincipal POSUserDetails userDetails,
		@Valid @PathVariable UUID serviceId,
		@Valid @PathVariable UUID serviceDiscountId) {
		
		serviceService.removeDiscountFromService(userDetails, serviceId, serviceDiscountId);
		return ResponseEntity.ok().build();
	}

	@Operation(summary = "Add tax to a service")
	@PostMapping("/{serviceId}/tax")
	public ResponseEntity<Void> addTax(
		@AuthenticationPrincipal POSUserDetails userDetails,
		@Valid @PathVariable UUID serviceId,
		@Valid @RequestBody TaxRequest addTaxRequest) {
		
		serviceService.addTaxToService(userDetails, serviceId, addTaxRequest);
		return ResponseEntity.ok().build();
	}

	@Operation(summary = "Remove a tax from a service")
	@DeleteMapping("/{serviceId}/tax/{serviceTaxId}")
	public ResponseEntity<Void> removeTax(
		@AuthenticationPrincipal POSUserDetails userDetails,
		@Valid @PathVariable UUID serviceId,
		@Valid @PathVariable UUID serviceTaxId) {
		
		serviceService.removeTaxFromService(userDetails, serviceId, serviceTaxId);
		return ResponseEntity.ok().build();
	}
}

