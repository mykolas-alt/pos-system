package com.ffive.pos_system.dto;

import java.util.UUID;

import com.ffive.pos_system.model.ProductOptionType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GUIProductOptionGroup implements GUIObject {
    private UUID id;
    private UUID productId;
    private String name;
    private ProductOptionType type;
    private int minSelect;
    private int maxSelect;
}
