package com.ffive.pos_system.controller;

import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AddTaxToOrderItemRequest {
    private UUID taxId;
}
