package com.ffive.pos_system.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ffive.pos_system.dto.BusinessCreationRequest;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.BusinessService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/business")
@Tag(name = "Business", description = "Business management endpoints")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessService businessService;

    @PostMapping
    public String createBusiness(@RequestBody BusinessCreationRequest businessCreationRequest,
            @AuthenticationPrincipal POSUserDetails userDetails) {
        businessService.createBusiness(businessCreationRequest, userDetails);
        return "Business created";
    }

}
