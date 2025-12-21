package com.ffive.pos_system.controller;

import java.util.Optional;
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

import com.ffive.pos_system.dto.GUIPage;
import com.ffive.pos_system.dto.GUITax;
import com.ffive.pos_system.dto.TaxCreationRequest;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.TaxService;
import com.ffive.pos_system.util.PagingHelper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/tax")
@Tag(name = "Tax", description = "Tax management endpoints")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("@authorizationHelper.hasEmployee(authentication)")
public class TaxController {

    private final TaxService taxService;
    private final PagingHelper pagingHelper;

    @Operation(summary = "Create a new tax")
    @PostMapping
    public ResponseEntity<GUITax> createTax(@AuthenticationPrincipal POSUserDetails userDetails,
            @Valid @RequestBody TaxCreationRequest taxCreationRequest) {
        return ResponseEntity.ok(taxService.createTax(userDetails, taxCreationRequest));
    }

    @Operation(summary = "Update an existing tax")
    @PutMapping("/{taxId}")
    public ResponseEntity<GUITax> updateTax(@AuthenticationPrincipal POSUserDetails userDetails,
            @PathVariable UUID taxId,
            @Valid @RequestBody TaxCreationRequest taxModificationRequest) {

        return ResponseEntity.ok(taxService.modifyTax(userDetails, taxId, taxModificationRequest));
    }

    @Operation(summary = "Deactivate an existing tax")
    @DeleteMapping("/{taxId}")
    public ResponseEntity<GUITax> deactivateTax(@AuthenticationPrincipal POSUserDetails userDetails,
            @PathVariable UUID taxId) {

        return ResponseEntity.ok(taxService.deativateTax(userDetails, taxId));
    }

    @Operation(summary = "Get all taxes for the authenticated user's business")
    @GetMapping
    public GUIPage<GUITax> getTaxes(@AuthenticationPrincipal POSUserDetails userDetails,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<Integer> size) {
        return taxService.getAllTaxes(userDetails,
                pagingHelper.getValidPageNumber(page),
                pagingHelper.getValidPageSize(size));
    }
}
