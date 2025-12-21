package com.ffive.pos_system.service;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.ffive.pos_system.converter.gui.GUIPageConverter;
import com.ffive.pos_system.dto.GUIPage;
import com.ffive.pos_system.dto.GUITax;
import com.ffive.pos_system.dto.TaxCreationRequest;
import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.POSUser;
import com.ffive.pos_system.model.Tax;
import com.ffive.pos_system.repository.TaxRepository;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.validation.ValidationException;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class TaxService {

    private final TaxRepository taxRepository;
    private final GUIPageConverter guiPageConverter;

    public GUITax createTax(POSUserDetails userDetails, @Valid TaxCreationRequest taxCreationRequest) {
        var business = resolveBusinessFromUserDetails(userDetails);

        Tax tax = Tax.builder()
                .name(taxCreationRequest.getName())
                .type(taxCreationRequest.getType())
                .rate(taxCreationRequest.getRate())
                .business(business)
                .active(true)
                .build();

        tax = taxRepository.save(tax);

        return converToGUITax(tax);
    }

    public GUITax modifyTax(POSUserDetails userDetails, UUID taxId,
            @Valid TaxCreationRequest taxModificationRequest) {
        var business = resolveBusinessFromUserDetails(userDetails);
        var tax = taxRepository.findById(taxId)
                .orElseThrow(() -> new ValidationException("Tax with ID " + taxId + " does not exist"));

        if (!Objects.equals(tax.getBusiness().getId(), business.getId())) {
            throw new ValidationException("Tax with ID " + taxId + " does not belong to the user's business");
        }

        Optional.ofNullable(taxModificationRequest.getName())
                .ifPresent(tax::setName);
        Optional.ofNullable(taxModificationRequest.getRate())
                .ifPresent(tax::setRate);

        tax = taxRepository.save(tax);

        return converToGUITax(tax);
    }

    public GUIPage<GUITax> getAllTaxes(POSUserDetails userDetails, int pageNumber, int pageSize) {
        var business = resolveBusinessFromUserDetails(userDetails);

        var page = taxRepository.findAllByBusiness(business, PageRequest.of(pageNumber, pageSize));
        return guiPageConverter.convertToGUIPage(page, this::converToGUITax);
    }

    private GUITax converToGUITax(Tax tax) {
        return GUITax.builder()
                .id(tax.getId())
                .name(tax.getName())
                .type(tax.getType())
                .rate(tax.getRate())
                .active(tax.getActive())
                .build();
    }

    private Business resolveBusinessFromUserDetails(POSUserDetails userDetails) {
        return Optional.ofNullable(userDetails.getUser())
                .map(POSUser::getEmployee)
                .map(Employee::getBusiness)
                .orElseThrow(() -> new ValidationException("Authenticated user is not associated with any business"));
    }

    public GUITax deativateTax(POSUserDetails userDetails, UUID taxId) {
        var business = resolveBusinessFromUserDetails(userDetails);
        var persistedTax = taxRepository.findById(taxId)
                .filter(tax -> tax.getActive())
                .orElseThrow(() -> new ValidationException("Tax with ID " + taxId + " does not exist"));

        if (!Objects.equals(persistedTax.getBusiness().getId(), business.getId())) {
            throw new ValidationException("Tax with ID " + taxId + " does not belong to the user's business");
        }
        persistedTax.setActive(false);
        persistedTax = taxRepository.save(persistedTax);

        return converToGUITax(persistedTax);
    }
}
