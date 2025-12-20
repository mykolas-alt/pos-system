package com.ffive.pos_system.controller;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductOptionValueCreationRequest {
    private UUID optionGroupId;
    private String name;
    private BigDecimal priceDelta;
}
