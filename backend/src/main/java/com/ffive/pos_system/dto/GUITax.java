package com.ffive.pos_system.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.ffive.pos_system.model.TaxType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GUITax implements GUIObject {
    private UUID id;
    private String name;
    private BigDecimal rate;
    private Boolean active;
    private TaxType type;
}
