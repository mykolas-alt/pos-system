package com.ffive.pos_system.dto;

import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddProductToOrderRequest {

    private UUID productId;
    private int quantity;
}
