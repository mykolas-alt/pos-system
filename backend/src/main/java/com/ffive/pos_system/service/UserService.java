package com.ffive.pos_system.service;

import static com.ffive.pos_system.service.validation.ValidationMessageConstants.MODIFYING_NON_EXISTENT_ENTITY;

import java.util.Arrays;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ffive.pos_system.dto.UserCreationRequest;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.POSUser;
import com.ffive.pos_system.model.UserRole;
import com.ffive.pos_system.model.UserRoleType;
import com.ffive.pos_system.repository.UserRepository;
import com.ffive.pos_system.repository.UserRoleRepository;

import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repo;
    private final UserRoleRepository userRoleRepo;
    private final PasswordEncoder passwordEncoder;

    public POSUser createUser(UserCreationRequest request, Employee employee, UserRole... roles) {
        POSUser user = POSUser.builder()
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .username(request.getUsername())
                .employee(employee)
                .roles(Arrays.asList(roles))
                .build();

        log.info("Creating user with name: " + request.getUsername());
        // TODO: add validator

        return repo.save(user);
    }

    public POSUser createUser(UserCreationRequest request) {
        UserRole businessOwnerRole = userRoleRepo.findByRoleType(UserRoleType.BUSINESS_OWNER)
                .orElseThrow(() -> new IllegalStateException("Business owner role is missing"));
        return createUser(request, null, businessOwnerRole);
    }

    public POSUser modifyUser(POSUser user) {
        if (user.getId() == null || !repo.existsById(user.getId())) {
            throw new ValidationException(MODIFYING_NON_EXISTENT_ENTITY);
        }
        // TODO: add validator

        return repo.save(user);
    }

    public List<POSUser> getAllUseres() {
        return repo.findAll();
    }
}
