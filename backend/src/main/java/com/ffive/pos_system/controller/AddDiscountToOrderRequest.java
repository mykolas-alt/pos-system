package com.ffive.pos_system.controller;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddDiscountToOrderRequest {
    @NotNull
    private UUID discountId;
    private LocalDateTime expiresAt;
}
