package com.ffive.pos_system.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ModifyOrderRequest {
    @NotNull
    private String name;
}
