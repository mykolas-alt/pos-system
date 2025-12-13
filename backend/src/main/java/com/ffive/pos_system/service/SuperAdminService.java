package com.ffive.pos_system.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.POSUser;
import com.ffive.pos_system.repository.BusinessRepository;
import com.ffive.pos_system.repository.UserRepository;
import com.ffive.pos_system.service.validation.ValidationException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SuperAdminService {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;

    public void setBusinessForSuperAdmin(POSUser user, UUID businessId) {
        if (!user.isSuperAdmin()) {
            throw new ValidationException("Only super admin users can be assigned a business dynamically");
        }

        user.setEmployee(Optional.ofNullable(businessId)
                .flatMap(businessRepository::findById)
                .map(Business::getOwner)
                .orElse(null));

        userRepository.save(user);
    }
}
