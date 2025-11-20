package com.ffive.pos_system.service;

import static com.ffive.pos_system.service.validation.ValidationMessageConstants.MODIFYING_NON_EXISTENT_ENTITY;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.repository.BusinessRepository;

import jakarta.validation.ValidationException;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class BusinessService {

    private final BusinessRepository repo;

    public BusinessService(BusinessRepository repo) {
        this.repo = repo;
    }

    public Business createBusiness(Business business) {
        log.info("Creating business with name: " + business.getName());
        // TODO: add validator

        return repo.save(business);
    }

    public Business modifyBusiness(Business business) {
        if (business.getId() == null || !repo.existsById(business.getId())) {
            throw new ValidationException(MODIFYING_NON_EXISTENT_ENTITY);
        }
        // TODO: add validator

        return repo.save(business);
    }

    public List<Business> getAllBusinesses() {
        return repo.findAll();
    }
}
