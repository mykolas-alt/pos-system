package com.ffive.pos_system.service;

import static com.ffive.pos_system.service.validation.ValidationMessageConstants.MODIFYING_NON_EXISTENT_ENTITY;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ffive.pos_system.dto.UserCreationRequest;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.POSUser;
import com.ffive.pos_system.repository.UserRepository;

import jakarta.validation.ValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repo;
    private final PasswordEncoder passwordEncoder;

    public POSUser createUser(UserCreationRequest request, Employee employee) {
        POSUser user = POSUser.builder()
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .username(request.getUsername())
                .employee(employee)
                .build();

        log.info("Creating user with name: " + request.getUsername());
        // TODO: add validator

        return repo.save(user);
    }

    public POSUser createUser(UserCreationRequest request) {
        return createUser(request, null);
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
