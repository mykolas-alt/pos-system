package com.ffive.pos_system.handler;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddTaxToOrderRequest {
    @NotNull
    private UUID taxId;
}
