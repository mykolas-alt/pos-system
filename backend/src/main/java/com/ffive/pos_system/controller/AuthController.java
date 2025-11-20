package com.ffive.pos_system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ffive.pos_system.dto.AuthResponse;
import com.ffive.pos_system.dto.LoginRequest;
import com.ffive.pos_system.dto.PasswordChangeRequest;
import com.ffive.pos_system.dto.UserCreationRequest;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.AuthService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication management endpoints")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody UserCreationRequest userCreationRequest) {
        return authService.registerUser(userCreationRequest)
                .map(token -> ResponseEntity.ok(new AuthResponse(token)))
                .orElse(ResponseEntity.status(401).build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        return authService.authenticate(loginRequest.getUsername(), loginRequest.getPassword())
                .map(token -> ResponseEntity.ok(new AuthResponse(token)))
                .orElse(ResponseEntity.status(401).build());
    }

    @GetMapping("/whoami")
    @PreAuthorize("@authorizationHelper.isAuthenticated(authentication)")
    public ResponseEntity<String> whoAmI(@AuthenticationPrincipal POSUserDetails userDetails) {

        return userDetails != null
                ? ResponseEntity.ok("You are: " + userDetails.getUsername())
                : ResponseEntity.status(401).build();
    }

    @PutMapping("/change-password")
    @PreAuthorize("@authorizationHelper.isAuthenticated(authentication)")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal POSUserDetails userDetails,
            @RequestBody PasswordChangeRequest passwordChangeRequest) {
        if (userDetails == null || userDetails.getUser() == null) {
            return ResponseEntity.status(401).build();
        }
        authService.changePassword(userDetails.getUser(), passwordChangeRequest);
        return ResponseEntity.ok().build();
    }
}
package com.ffive.pos_system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ffive.pos_system.dto.AuthResponse;
import com.ffive.pos_system.dto.EmployeeCreationRequest;
import com.ffive.pos_system.dto.LoginRequest;
import com.ffive.pos_system.service.AuthService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication management endpoints")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody EmployeeCreationRequest employeeRequest) {
        return authService.registerEmployee(employeeRequest)
                .map(token -> ResponseEntity.ok(new AuthResponse(token)))
                .orElse(ResponseEntity.status(401).build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        return authService.authenticate(loginRequest.getUsername(), loginRequest.getPassword())
                .map(token -> ResponseEntity.ok(new AuthResponse(token)))
                .orElse(ResponseEntity.status(401).build());
    }
}
