package com.ffive.pos_system.dto;

import java.math.BigDecimal;

import com.ffive.pos_system.model.TaxType;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TaxCreationRequest {
    @NotNull
    private String name;
    @NotNull
    private BigDecimal rate;
    @NotNull
    private TaxType type;
}
