package com.ffive.pos_system.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ffive.pos_system.model.Business;
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
    public String createBusiness(@RequestBody Business business) {
        businessService.createBusiness(business);
        return "Business created";
    }

    @GetMapping
    public List<Business> getBusinesss() {
        return businessService.getAllBusinesses();
    }
}
