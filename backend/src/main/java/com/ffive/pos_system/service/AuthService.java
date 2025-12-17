package com.ffive.pos_system.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ffive.pos_system.converter.gui.GUIBusinessConverter;
import com.ffive.pos_system.dto.GUIUserInfo;
import com.ffive.pos_system.dto.PasswordChangeRequest;
import com.ffive.pos_system.dto.UserCreationRequest;
import com.ffive.pos_system.model.POSUser;
import com.ffive.pos_system.model.UserRole;
import com.ffive.pos_system.repository.UserRepository;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.validation.ValidationException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserService userService;
    private final GUIBusinessConverter businessConverter;

    public Optional<String> registerUser(UserCreationRequest request) {
        log.info("Registering new employee with username: {}", request);
        return Optional.ofNullable(userService.createUser(request))
                .map(POSUser::getUsername)
                .map(jwtService::generateToken);
    }

    public Optional<String> authenticate(String username, String password) {
        log.info("Authenticating user: {}", username);
        return userRepository.findByUsername(username)
                .filter(user -> passwordEncoder.matches(password, user.getPasswordHash()))
                .map(user -> {
                    if (user.isSuperAdmin()) {
                        user.setEmployee(null);
                        userRepository.save(user);
                    }
                    return jwtService.generateToken(user.getUsername());
                });
    }

    public void changePassword(POSUser user, PasswordChangeRequest passwordChangeRequest) {
        userRepository.findById(user.getId()).ifPresent(existingUser -> {
            existingUser.setPasswordHash(passwordEncoder.encode(passwordChangeRequest.getNewPassword()));
            userRepository.save(existingUser);
            log.info("Password changed for user: {}", existingUser.getUsername());
        });
    }

    public GUIUserInfo getUserInfo(POSUserDetails userDetails) {
        return Optional.ofNullable(userDetails.getUser())
                .map(user -> {
                    var builder = GUIUserInfo.builder()
                            .username(user.getUsername())
                            .roles(user.getRoles().stream().map(UserRole::getRoleType).toList());

                    Optional.ofNullable(user.getEmployee()).ifPresent(employee -> {
                        builder.name(employee.getName())
                                .email(employee.getEmail())
                                .business(businessConverter.convertToGUIBusiness(employee.getBusiness()));
                    });
                    return builder.build();
                })
                .orElseThrow(() -> new ValidationException("User not found"));
    }
}
