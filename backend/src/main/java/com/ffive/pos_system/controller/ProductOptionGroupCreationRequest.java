package com.ffive.pos_system.controller;

import java.util.UUID;

import com.ffive.pos_system.model.ProductOptionType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductOptionGroupCreationRequest {
    private UUID productId;
    private String name;
    private ProductOptionType type;
    private int minSelect;
    private int maxSelect;
}
