package com.ffive.pos_system.dto;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddProductToOrderRequest {

    @NotNull
    private UUID productId;
    @Min(1)
    private int quantity;
}
