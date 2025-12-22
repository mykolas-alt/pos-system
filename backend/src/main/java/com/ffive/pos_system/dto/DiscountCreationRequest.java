package com.ffive.pos_system.dto;

import java.math.BigDecimal;

import com.ffive.pos_system.model.DiscountType;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DiscountCreationRequest {
    @NotNull
    private String name;
    @NotNull
    private BigDecimal value;
    @NotNull
    private DiscountType type;
}
