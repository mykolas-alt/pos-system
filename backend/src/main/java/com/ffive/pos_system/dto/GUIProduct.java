package com.ffive.pos_system.dto;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GUIProduct {
    private UUID id;
    private String name;
    private BigDecimal price;
}
