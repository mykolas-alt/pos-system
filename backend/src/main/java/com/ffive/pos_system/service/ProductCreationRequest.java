package com.ffive.pos_system.service;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductCreationRequest {
    @NotNull
    private String name;
    @NotNull
    private BigDecimal price;
}
