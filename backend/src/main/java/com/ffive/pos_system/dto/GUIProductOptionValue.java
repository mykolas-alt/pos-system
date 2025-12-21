package com.ffive.pos_system.dto;

import java.math.BigDecimal;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GUIProductOptionValue implements GUIObject {
    private UUID id;
    private UUID optionGroupId;
    private String name;
    private BigDecimal priceDelta;
}
