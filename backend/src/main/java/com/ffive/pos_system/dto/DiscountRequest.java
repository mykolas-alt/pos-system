package com.ffive.pos_system.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DiscountRequest {
    @NotNull
    private UUID id;
    private LocalDateTime expiresAt;
}
