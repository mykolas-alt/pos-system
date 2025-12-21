package com.ffive.pos_system.dto;

import java.math.BigDecimal;

import com.ffive.pos_system.model.DiscountType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DiscountCreationRequest {
    private String name;
    private BigDecimal value;
    private DiscountType type;
}
