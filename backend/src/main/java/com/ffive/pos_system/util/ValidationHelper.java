
package com.ffive.pos_system.util;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.repository.UserRepository;
import com.ffive.pos_system.service.validation.ValidationException;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ValidationHelper {

    private final UserRepository userRepository;

    public void validateUsernameNotTaken(String username) {
        if (userRepository.existsByUsername(username)) {
            throw new ValidationException("Username is already taken");
        }
    }
}
