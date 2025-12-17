package com.ffive.pos_system.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.SuperAdminService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@Tag(name = "Super Admin", description = "Endoints available to Super Admins only")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService adminService;

    @PutMapping("/admin/set-business")
    public ResponseEntity<Void> setBusinessForAdmin(@RequestParam(required = false) UUID businessId,
            @AuthenticationPrincipal POSUserDetails userDetails) {
        adminService.setBusinessForSuperAdmin(userDetails.getUser(), businessId);
        return ResponseEntity.ok().build();
    }
}
