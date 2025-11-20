package com.ffive.pos_system.service;

import static com.ffive.pos_system.service.validation.ValidationMessageConstants.MODIFYING_NON_EXISTENT_ENTITY;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ffive.pos_system.model.POSUser;
import com.ffive.pos_system.repository.UserRepository;

import jakarta.validation.ValidationException;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserService {

    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    public POSUser createUser(POSUser user) {
        log.info("Creating user with name: " + user.getUsername());
        // TODO: add validator

        return repo.save(user);
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
