package com.ffive.pos_system.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ffive.pos_system.model.ProductOptionType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GUIOrderItemOption implements GUIObject {
    private UUID orderItemOptionId;

    private UUID groupId;
    private String groupName;
    private ProductOptionType type;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private UUID valueId;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String valueName;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private BigDecimal priceDelta;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Integer value;
}
