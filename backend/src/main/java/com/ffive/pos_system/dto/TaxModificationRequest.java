package com.ffive.pos_system.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TaxModificationRequest {
    @NotNull
    private String name;
    @NotNull
    private BigDecimal rate;
}
