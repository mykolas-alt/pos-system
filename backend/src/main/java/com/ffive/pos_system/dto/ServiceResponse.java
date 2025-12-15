package com.ffive.pos_system.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ServiceResponse {
    private UUID id;
    private String name;
    private UUID specialistId;
    private long duration;
    private LocalDateTime opensAt;
    private LocalDateTime closesAt;
    private BigDecimal price;
}
