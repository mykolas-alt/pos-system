package com.ffive.pos_system.dto;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TaxModificationRequest {
    private String name;
    private BigDecimal rate;
}
