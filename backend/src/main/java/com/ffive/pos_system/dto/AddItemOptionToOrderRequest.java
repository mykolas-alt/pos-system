package com.ffive.pos_system.dto;

import java.util.Optional;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddItemOptionToOrderRequest {
    @NotNull
    private UUID itemOptionId;
    private Optional<UUID> optionValueId;
    private Optional<Integer> value;
}
