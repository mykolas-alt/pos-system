package com.ffive.pos_system.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.ffive.pos_system.model.OrderStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GUIOrder {
    private UUID id;
    private LocalDateTime createdAt;
    private LocalDateTime closedAt;
    private OrderStatus status;
    private BigDecimal total;
    private UUID identEmployee;
    private List<GUIOrderItem> items;
}
