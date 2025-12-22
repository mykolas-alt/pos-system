package com.ffive.pos_system.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.ffive.pos_system.model.DiscountType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GUIDiscount implements GUIObject {
    private UUID id;
    private String name;
    private BigDecimal value;
    private DiscountType type;
    private boolean active;
}
