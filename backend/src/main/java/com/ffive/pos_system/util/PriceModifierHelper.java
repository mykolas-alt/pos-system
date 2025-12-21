package com.ffive.pos_system.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.model.DiscountType;
import com.ffive.pos_system.model.Discountable;
import com.ffive.pos_system.model.TaxType;
import com.ffive.pos_system.model.Taxable;

@Component
public class PriceModifierHelper {

    public <D extends Discountable, T extends Taxable> BigDecimal getPriceAfterModifiersFromSnapshots(List<D> discounts,
            List<T> taxables,
            BigDecimal basePrice) {
        return Optional.ofNullable(basePrice)
                .map(price -> getPriceAfterDiscounts(price, discounts, this::getValueFromSnapshots))
                .map(price -> getPriceAfterTaxes(price, taxables, this::getRateFromSnapshots))
                .orElse(BigDecimal.ZERO);
    }

    public <D extends Discountable, T extends Taxable> BigDecimal getPriceAfterModifiersFromEntities(List<D> discounts,
            List<T> taxables,
            BigDecimal basePrice) {
        return Optional.ofNullable(basePrice)
                .map(price -> getPriceAfterDiscounts(price, discounts, this::getValueFromEntity))
                .map(price -> getPriceAfterTaxes(price, taxables, this::getRateFromEntity))
                .orElse(BigDecimal.ZERO);
    }

    private <T extends Discountable> BigDecimal getPriceAfterDiscounts(BigDecimal priceBeforeTaxesAndDiscounts,
            List<T> discounts,
            Function<T, BigDecimal> getDiscountValue) {

        Map<DiscountType, BigDecimal> discountTotals = new HashMap<>();
        discountTotals.put(DiscountType.FLAT, BigDecimal.ZERO);
        discountTotals.put(DiscountType.PERCENTAGE, BigDecimal.ZERO);

        discounts.forEach(discount -> {
            discountTotals.compute(discount.getDiscount().getType(),
                    (key, total) -> total.add(getDiscountValue.apply(discount)));
        });

        var percentageDiscountRate = Optional.of(discountTotals.get(DiscountType.PERCENTAGE))
                .filter(rate -> rate.compareTo(BigDecimal.valueOf(100)) <= 0)
                .map(rate -> BigDecimal.ONE.subtract(rate.divide(BigDecimal.valueOf(100), 2, RoundingMode.DOWN)))
                .orElse(BigDecimal.ZERO);

        return Optional.of(priceBeforeTaxesAndDiscounts)
                .filter(price -> price.compareTo(discountTotals.get(DiscountType.FLAT)) > 0)
                .map(price -> price.subtract(discountTotals.get(DiscountType.FLAT)))
                .map(priceAfterFlatDiscount -> priceAfterFlatDiscount.multiply(percentageDiscountRate))
                .orElse(BigDecimal.ZERO);
    }

    private <T extends Taxable> BigDecimal getPriceAfterTaxes(BigDecimal priceBeforeTaxes,
            List<T> taxables,
            Function<T, BigDecimal> getTaxRate) {
        Map<TaxType, BigDecimal> taxTotals = new HashMap<>();
        taxTotals.put(TaxType.SERVICE_CHARGE, BigDecimal.ZERO);
        taxTotals.put(TaxType.CUSTOM_TAX, BigDecimal.ZERO);

        taxables.forEach(tax -> {
            taxTotals.compute(tax.getTax().getType(),
                    (key, total) -> total.add(getTaxRate.apply(tax)));
        });

        var percentageTaxRate = Optional.of(taxTotals.get(TaxType.CUSTOM_TAX))
                .filter(rate -> rate.compareTo(BigDecimal.valueOf(100)) <= 0)
                .map(rate -> BigDecimal.ONE.add(rate.divide(BigDecimal.valueOf(100), 2, RoundingMode.DOWN)))
                .orElse(BigDecimal.ZERO);

        return priceBeforeTaxes
                .multiply(percentageTaxRate)
                .add(taxTotals.get(TaxType.SERVICE_CHARGE));
    }

    private BigDecimal getValueFromSnapshots(Discountable discountable) {
        return discountable.getValueSnapshot();
    }

    private BigDecimal getRateFromSnapshots(Taxable taxable) {
        return taxable.getRateSnapshot();
    }

    private BigDecimal getValueFromEntity(Discountable discountable) {
        return discountable.getDiscount().getValue();
    }

    private BigDecimal getRateFromEntity(Taxable taxable) {
        return taxable.getTax().getRate();
    }
}
