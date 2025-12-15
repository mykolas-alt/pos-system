package com.ffive.pos_system.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ServiceRequest {
    
    @NotNull
    private String name;

    @NotNull
    private UUID specialistId;

    @Positive
    private long duration;

    @NotNull
    private LocalDateTime opensAt;

    @NotNull
    private LocalDateTime closesAt;

    @NotNull
    @Positive
    private BigDecimal price;
}
