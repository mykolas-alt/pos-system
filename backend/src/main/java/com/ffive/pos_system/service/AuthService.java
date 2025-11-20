package com.ffive.pos_system.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ffive.pos_system.dto.EmployeeCreationRequest;
import com.ffive.pos_system.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmployeeService employeeService;

    public Optional<String> registerEmployee(EmployeeCreationRequest request) {
        log.info("Registering new employee with username: {}", request);
        return Optional.ofNullable(employeeService.createEmployee(request))
                .map(employee -> employee.getUserAccount().getUsername())
                .map(jwtService::generateToken);
    }

    public Optional<String> authenticate(String username, String password) {
        return userRepository.findByUsername(username)
                .filter(user -> passwordEncoder.matches(password, user.getPasswordHash()))
                .map(user -> jwtService.generateToken(user.getUsername()));
    }
}
