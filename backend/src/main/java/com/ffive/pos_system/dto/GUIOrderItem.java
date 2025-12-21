package com.ffive.pos_system.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GUIOrderItem implements GUIObject {
    private UUID id;
    private GUIProduct product;
    private BigDecimal totalItemPrice;
    private int quantity;
    private List<GUIOrderItemOption> options;
}
