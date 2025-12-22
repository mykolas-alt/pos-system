package com.ffive.pos_system.handler;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.ReservationStatus;
import com.ffive.pos_system.model.Reservation;
import com.ffive.pos_system.model.OrderItem;
import com.ffive.pos_system.model.OrderStatus;
import com.ffive.pos_system.model.Product;
import com.ffive.pos_system.model.DiscountType;
import com.ffive.pos_system.repository.ReservationRepository;
import com.ffive.pos_system.repository.ServiceRepository;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.service.validation.ValidationException;
import com.ffive.pos_system.util.PriceModifierHelper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ReservationStateHandler {

    private final ReservationRepository reservationRepository;
    private final ServiceRepository serviceRepository;
    private final EmployeeRepository employeeRepository;
    private final PriceModifierHelper priceModifierHelper;

    private void validateReservation(Reservation reservation, UUID businessId) {
        if (!Objects.equals(reservation.getBusiness().getId(), businessId)) {
            throw new ValidationException("Reservation does not belong to the employee's business");
        }
    }

    private void validateReservationStatus(Reservation reservation){
        if (reservation.getStatus()!= ReservationStatus.OPEN){
            throw new ValidationException("Only open reservations and inprogress can be completed");
        }
    }

    @Transactional
    public void completeReservation(Employee employee, Reservation reservation) {
      
        validateReservation(reservation, employee.getBusiness().getId());
        validateReservationStatus(reservation);
        reservation.setStatus(ReservationStatus.IN_PROGRESS);
        
        // Snapshot reservation taxes and discounts
        reservation.getTaxes().forEach(tax -> {
            tax.setNameSnapshot(tax.getTax().getName());
            tax.setRateSnapshot(tax.getTax().getRate());
        });

        reservation.getDiscounts().forEach(discount -> {
            discount.setNameSnapshot(discount.getDiscount().getName());
            discount.setValueSnapshot(discount.getDiscount().getValue());
        });

        BigDecimal total = reservation.getService().getPrice();
        var serviceDiscounts = Optional.ofNullable(reservation.getService().getDiscounts())
            .orElseGet(List::of);
        
        BigDecimal serviceFlatDiscount = BigDecimal.ZERO;
        BigDecimal servicePercentageDiscount = BigDecimal.ZERO;
        
        for (var discount : serviceDiscounts) {
            if (discount.getDiscount().getType() == DiscountType.FLAT) {
                serviceFlatDiscount = serviceFlatDiscount.add(discount.getDiscount().getValue());
            } else if (discount.getDiscount().getType() == DiscountType.PERCENTAGE) {
                servicePercentageDiscount = servicePercentageDiscount.add(discount.getDiscount().getValue());
            }
        }
       
        total = total.subtract(serviceFlatDiscount).max(BigDecimal.ZERO);
        
        if (servicePercentageDiscount.compareTo(BigDecimal.ZERO) > 0 && 
            servicePercentageDiscount.compareTo(BigDecimal.valueOf(100)) <= 0) {
            BigDecimal discountMultiplier = BigDecimal.ONE.subtract(
                servicePercentageDiscount.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
            total = total.multiply(discountMultiplier);
        }

        var serviceTaxes = Optional.ofNullable(reservation.getService().getTaxes())
            .orElseGet(List::of);
        
        BigDecimal serviceTaxRate = BigDecimal.ZERO;
        
        for (var tax : serviceTaxes) {
            BigDecimal rate = tax.getTax().getRate();
            if (rate.compareTo(BigDecimal.valueOf(100)) <= 0) {
                serviceTaxRate = serviceTaxRate.add(rate);
            }
        }
        
        if (serviceTaxRate.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal taxMultiplier = BigDecimal.ONE.add(
                serviceTaxRate.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
            total = total.multiply(taxMultiplier);
        }

        var reservationDiscounts = Optional.ofNullable(reservation.getDiscounts())
            .orElseGet(List::of);
        
        BigDecimal reservationFlatDiscount = BigDecimal.ZERO;
        BigDecimal reservationPercentageDiscount = BigDecimal.ZERO;
        
        for (var discount : reservationDiscounts) {
            if (discount.getDiscount().getType() == DiscountType.FLAT) {
                reservationFlatDiscount = reservationFlatDiscount.add(discount.getDiscount().getValue());
            } else if (discount.getDiscount().getType() == DiscountType.PERCENTAGE) {
                reservationPercentageDiscount = reservationPercentageDiscount.add(discount.getDiscount().getValue());
            }
        }
        
        total = total.subtract(reservationFlatDiscount).max(BigDecimal.ZERO);
        if (reservationPercentageDiscount.compareTo(BigDecimal.ZERO) > 0 && 
            reservationPercentageDiscount.compareTo(BigDecimal.valueOf(100)) <= 0) {
            BigDecimal discountMultiplier = BigDecimal.ONE.subtract(
                reservationPercentageDiscount.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
            total = total.multiply(discountMultiplier);
        }

        var reservationTaxes = Optional.ofNullable(reservation.getTaxes())
            .orElseGet(List::of);
        
        BigDecimal reservationTaxRate = BigDecimal.ZERO;
        
        for (var tax : reservationTaxes) {
            BigDecimal rate = tax.getTax().getRate();
            if (rate.compareTo(BigDecimal.valueOf(100)) <= 0) {
                reservationTaxRate = reservationTaxRate.add(rate);
            }
        }
        
        if (reservationTaxRate.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal taxMultiplier = BigDecimal.ONE.add(
                reservationTaxRate.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
            total = total.multiply(taxMultiplier);
        }

        reservation.setTotalAmount(total);
        reservationRepository.save(reservation);
    }


}