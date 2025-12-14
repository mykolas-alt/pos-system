package com.ffive.pos_system.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ModifyOrderItemRequest {
    private int quantity;
}
