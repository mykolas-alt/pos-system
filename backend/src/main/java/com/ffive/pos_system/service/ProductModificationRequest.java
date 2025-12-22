package com.ffive.pos_system.service;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductModificationRequest {
    private String name;
    private BigDecimal price;
}
