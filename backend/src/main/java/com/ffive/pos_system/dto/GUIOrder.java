package com.ffive.pos_system.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ffive.pos_system.model.OrderStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GUIOrder implements GUIObject {
    private UUID id;
    private LocalDateTime createdAt;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private LocalDateTime closedAt;
    private OrderStatus status;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private BigDecimal total;
    private UUID identEmployee;
    private List<GUIOrderItem> items;
}
