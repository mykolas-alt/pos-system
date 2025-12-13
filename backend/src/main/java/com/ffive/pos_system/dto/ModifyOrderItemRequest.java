package com.ffive.pos_system.dto;

import jakarta.validation.constraints.Min;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ModifyOrderItemRequest {
    @Min(1)
    private int quantity;
}
