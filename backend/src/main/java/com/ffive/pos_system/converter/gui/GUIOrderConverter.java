package com.ffive.pos_system.converter.gui;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.dto.GUIDiscount;
import com.ffive.pos_system.dto.GUIOrder;
import com.ffive.pos_system.dto.GUIOrderItem;
import com.ffive.pos_system.dto.GUIOrderItemOption;
import com.ffive.pos_system.dto.GUIProduct;
import com.ffive.pos_system.dto.GUITax;
import com.ffive.pos_system.model.Order;
import com.ffive.pos_system.model.ProductOptionValue;
import com.ffive.pos_system.model.Taxable;
import com.ffive.pos_system.util.ItemTotalsHelper;
import com.ffive.pos_system.util.PriceModifierHelper;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class GUIOrderConverter {

    private final ItemTotalsHelper itemTotalsHelper;
    private final PriceModifierHelper priceModifierHelper;

    public GUIOrder convertOrderFromCurrentState(Order order) {
        return GUIOrder.builder()
                .id(order.getId())
                .orderTaxes(order.getTaxes().stream()
                        .filter(tax -> !tax.getTax().isServiceCharge())
                        .map(tax -> GUITax.builder()
                                .name(tax.getTax().getName())
                                .rate(tax.getTax().getRate())
                                .type(tax.getTax().getType())
                                .active(tax.getTax().getActive())
                                .id(tax.getId())
                                .build())
                        .toList())
                .orderDiscounts(order.getDiscounts().stream()
                        .map(discount -> GUIDiscount.builder()
                                .name(discount.getDiscount().getName())
                                .value(discount.getDiscount().getValue())
                                .type(discount.getDiscount().getType())
                                .active(discount.getDiscount().getActive())
                                .id(discount.getId())
                                .build())
                        .toList())
                .serviceCharge(order.getTaxes().stream()
                        .filter(tax -> tax.getTax().isServiceCharge())
                        .map(tax -> tax.getTax().getRate())
                        .reduce(BigDecimal.ZERO, BigDecimal::add))
                .createdAt(order.getCreatedAt())
                .closedAt(order.getClosedAt())
                .status(order.getStatus())
                .total(calculateTotalFronCurrentState(order))
                .paidAmount(order.getPaidAmount())
                .note(order.getNote())
                .identEmployee(order.getEmployee().getId())
                .items(order.getItems().stream()
                        .map(orderItem -> GUIOrderItem.builder()
                                .id(orderItem.getId())
                                .orderItemTaxes(orderItem.getTaxes().stream()
                                        .filter(tax -> !tax.getTax().isServiceCharge())
                                        .map(tax -> GUITax.builder()
                                                .name(tax.getTax().getName())
                                                .rate(tax.getTax().getRate())
                                                .type(tax.getTax().getType())
                                                .active(tax.getTax().getActive())
                                                .id(tax.getId())
                                                .build())
                                        .toList())
                                .orderItemDiscounts(orderItem.getDiscounts().stream()
                                        .map(discount -> GUIDiscount.builder()
                                                .name(discount.getDiscount().getName())
                                                .value(discount.getDiscount().getValue())
                                                .type(discount.getDiscount().getType())
                                                .active(discount.getDiscount().getActive())
                                                .id(discount.getId())
                                                .build())
                                        .toList())
                                .serviceCharge(orderItem.getTaxes().stream()
                                        .filter(tax -> tax.getTax().isServiceCharge())
                                        .map(tax -> tax.getTax().getRate())
                                        .reduce(BigDecimal.ZERO, BigDecimal::add))
                                .options(orderItem.getItemOptions().stream()
                                        .map(option -> GUIOrderItemOption.builder()
                                                .orderItemOptionId(option.getId())
                                                .groupId(option.getOptionGroup().getId())
                                                .groupName(option.getOptionGroup().getName())
                                                .type(option.getOptionGroup().getType())
                                                .valueId(Optional.ofNullable(option.getOptionValue())
                                                        .map(ProductOptionValue::getId).orElse(null))
                                                .valueName(Optional.ofNullable(option.getOptionValue())
                                                        .map(ProductOptionValue::getName).orElse(null))
                                                .priceDelta(Optional.ofNullable(option.getOptionValue())
                                                        .map(ProductOptionValue::getPriceDelta).orElse(null))
                                                .value(option.getValue())
                                                .build())
                                        .toList())
                                .product(GUIProduct.builder()
                                        .id(orderItem.getProduct().getId())
                                        .name(orderItem.getProduct().getName())
                                        .price(orderItem.getProduct().getPrice())
                                        .build())
                                .quantity(orderItem.getQuantity())
                                .totalItemPrice(itemTotalsHelper.getItemTotalFromEntities(orderItem))
                                .build())
                        .toList())
                .build();
    }

    public GUIOrder convertOrderFromSnapshot(Order order) {
        return GUIOrder.builder()
                .id(order.getId())
                .createdAt(order.getCreatedAt())
                .orderTaxes(order.getTaxes().stream()
                        .filter(tax -> !tax.getTax().isServiceCharge())
                        .map(tax -> GUITax.builder()
                                .name(tax.getNameSnapshot())
                                .rate(tax.getRateSnapshot())
                                .type(tax.getTax().getType())
                                .active(tax.getTax().getActive())
                                .id(tax.getId())
                                .build())
                        .toList())
                .orderDiscounts(order.getDiscounts().stream()
                        .map(discount -> GUIDiscount.builder()
                                .name(discount.getNameSnapshot())
                                .value(discount.getValueSnapshot())
                                .type(discount.getDiscount().getType())
                                .active(discount.getDiscount().getActive())
                                .id(discount.getId())
                                .build())
                        .toList())
                .closedAt(order.getClosedAt())
                .status(order.getStatus())
                .total(order.getTotal())
                .paidAmount(order.getPaidAmount())
                .note(order.getNote())
                .serviceCharge(order.getTaxes().stream()
                        .filter(tax -> tax.getTax().isServiceCharge())
                        .map(tax -> tax.getRateSnapshot())
                        .reduce(BigDecimal.ZERO, BigDecimal::add))
                .identEmployee(order.getEmployee().getId())
                .items(order.getItems().stream()
                        .map(orderItem -> GUIOrderItem.builder()
                                .id(orderItem.getId())
                                .serviceCharge(calculateServiceChargeFromSnapshot(orderItem.getTaxes()))
                                .orderItemTaxes(orderItem.getTaxes().stream()
                                        .filter(tax -> !tax.getTax().isServiceCharge())
                                        .map(tax -> GUITax.builder()
                                                .name(tax.getNameSnapshot())
                                                .rate(tax.getRateSnapshot())
                                                .type(tax.getTax().getType())
                                                .active(tax.getTax().getActive())
                                                .id(tax.getId())
                                                .build())
                                        .toList())
                                .orderItemDiscounts(orderItem.getDiscounts().stream()
                                        .map(discount -> GUIDiscount.builder()
                                                .name(discount.getNameSnapshot())
                                                .value(discount.getValueSnapshot())
                                                .type(discount.getDiscount().getType())
                                                .active(discount.getDiscount().getActive())
                                                .id(discount.getId())
                                                .build())
                                        .toList())
                                .options(orderItem.getItemOptions().stream()
                                        .map(option -> GUIOrderItemOption.builder()
                                                .orderItemOptionId(option.getId())
                                                .groupId(option.getOptionGroup().getId())
                                                .groupName(option.getOptionGroup().getName())
                                                .type(option.getOptionGroup().getType())
                                                .valueId(Optional.ofNullable(option.getOptionValue())
                                                        .map(ProductOptionValue::getId).orElse(null))
                                                .valueName(Optional.ofNullable(option.getOptionValue())
                                                        .map(ProductOptionValue::getName).orElse(null))
                                                .priceDelta(option.getPriceDeltaSnapshot())
                                                .value(option.getValue())
                                                .build())
                                        .toList())
                                .product(GUIProduct.builder()
                                        .id(orderItem.getProduct().getId())
                                        .name(orderItem.getProductNameSnapshot())
                                        .price(orderItem.getUnitPriceSnapshot())
                                        .build())
                                .quantity(orderItem.getQuantity())
                                .totalItemPrice(itemTotalsHelper.getItemTotalFromSnapshots(orderItem))
                                .build())
                        .toList())
                .build();
    }

    private <T extends Taxable> BigDecimal calculateServiceChargeFromSnapshot(List<T> taxables) {
        return taxables.stream()
                .filter(tax -> tax.getTax().isServiceCharge())
                .map(tax -> tax.getRateSnapshot())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateTotalFronCurrentState(Order order) {
        return priceModifierHelper.getPriceAfterModifiersFromEntities(order.getDiscounts(),
                order.getTaxes(),
                order.getItems().stream()
                        .map(itemTotalsHelper::getItemTotalFromEntities)
                        .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));
    }
}
