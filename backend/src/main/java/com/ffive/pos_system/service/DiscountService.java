package com.ffive.pos_system.service;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.ffive.pos_system.converter.gui.GUIPageConverter;
import com.ffive.pos_system.dto.DiscountCreationRequest;
import com.ffive.pos_system.dto.DiscountModificationRequest;
import com.ffive.pos_system.dto.GUIDiscount;
import com.ffive.pos_system.dto.GUIPage;
import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.Discount;
import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.POSUser;
import com.ffive.pos_system.repository.DiscountRepository;
import com.ffive.pos_system.security.POSUserDetails;
import com.ffive.pos_system.service.validation.ValidationException;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class DiscountService {

    private final DiscountRepository discountRepository;
    private final GUIPageConverter guiPageConverter;

    public GUIDiscount createDiscount(POSUserDetails userDetails,
            @Valid DiscountCreationRequest discountCreationRequest) {
        var business = resolveBusinessFromUserDetails(userDetails);

        Discount discount = Discount.builder()
                .name(discountCreationRequest.getName())
                .value(discountCreationRequest.getValue())
                .type(discountCreationRequest.getType())
                .business(business)
                .active(true)
                .build();

        discount = discountRepository.save(discount);

        return converToGUIDiscount(discount);
    }

    public GUIDiscount modifyDiscount(POSUserDetails userDetails, UUID discountId,
            @Valid DiscountModificationRequest discountModificationRequest) {
        var business = resolveBusinessFromUserDetails(userDetails);
        var discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ValidationException("Discount with ID " + discountId + " does not exist"));

        if (!Objects.equals(discount.getBusiness().getId(), business.getId())) {
            throw new ValidationException("Discount with ID " + discountId + " does not belong to the user's business");
        }

        Optional.ofNullable(discountModificationRequest.getName())
                .ifPresent(discount::setName);
        Optional.ofNullable(discountModificationRequest.getValue())
                .ifPresent(discount::setValue);

        discount = discountRepository.save(discount);

        return converToGUIDiscount(discount);
    }

    public GUIPage<GUIDiscount> getAllDiscounts(POSUserDetails userDetails, int pageNumber, int pageSize) {
        var business = resolveBusinessFromUserDetails(userDetails);

        var page = discountRepository.findAllByBusiness(business, PageRequest.of(pageNumber, pageSize));
        return guiPageConverter.convertToGUIPage(page, this::converToGUIDiscount);
    }

    private GUIDiscount converToGUIDiscount(Discount discount) {
        return GUIDiscount.builder()
                .id(discount.getId())
                .name(discount.getName())
                .value(discount.getValue())
                .type(discount.getType())
                .active(discount.getActive())
                .build();
    }

    private Business resolveBusinessFromUserDetails(POSUserDetails userDetails) {
        return Optional.ofNullable(userDetails.getUser())
                .map(POSUser::getEmployee)
                .map(Employee::getBusiness)
                .orElseThrow(() -> new ValidationException("Authenticated user is not associated with any business"));
    }

    public GUIDiscount deativateDiscount(POSUserDetails userDetails, UUID discountId) {
        var business = resolveBusinessFromUserDetails(userDetails);
        var persistedDiscount = discountRepository.findById(discountId)
                .filter(discount -> discount.getActive())
                .orElseThrow(() -> new ValidationException("Discount with ID " + discountId + " does not exist"));

        if (!Objects.equals(persistedDiscount.getBusiness().getId(), business.getId())) {
            throw new ValidationException("Discount with ID " + discountId + " does not belong to the user's business");
        }
        persistedDiscount.setActive(false);
        persistedDiscount = discountRepository.save(persistedDiscount);

        return converToGUIDiscount(persistedDiscount);
    }
}
