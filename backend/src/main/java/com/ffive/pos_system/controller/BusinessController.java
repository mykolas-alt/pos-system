package com.ffive.pos_system.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ffive.pos_system.dto.BusinessCreationRequest;
import com.ffive.pos_system.dto.GUIBusiness;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.BusinessService;
import com.ffive.pos_system.util.PagingHelper;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/business")
@Tag(name = "Business", description = "Business management endpoints")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessService businessService;
    private final PagingHelper pagingHelper;

    @PostMapping
    @PreAuthorize("@authorizationHelper.isAuthenticated(authentication)")
    public String createBusiness(@RequestBody BusinessCreationRequest businessCreationRequest,
            @AuthenticationPrincipal POSUserDetails userDetails) {
        businessService.createBusiness(businessCreationRequest, userDetails);
        return "Business created";
    }

    @GetMapping
    @PreAuthorize("@authorizationHelper.hasEmployee(authentication)")
    public ResponseEntity<GUIBusiness> getBusinesses(@AuthenticationPrincipal POSUserDetails userDetails) {
        return businessService.getBusinessForExecutingUser(userDetails.getUser().getEmployee())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    public List<GUIBusiness> getBusinesses(@AuthenticationPrincipal POSUserDetails userDetails,
            @RequestParam Optional<Integer> page, @RequestParam Optional<Integer> size) {
        return businessService.getBusinessesAllBusinesses(userDetails,
                pagingHelper.getValidPageNumber(page),
                pagingHelper.getValidPageSize(size));
    }

}
