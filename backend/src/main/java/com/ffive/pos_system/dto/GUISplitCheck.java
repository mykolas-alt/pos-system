package com.ffive.pos_system.dto;

import java.util.UUID;
import java.math.BigDecimal;
import com.ffive.pos_system.model.SplitCheckStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder

public class GUISplitCheck {
    private UUID id;
    private String name;
    private BigDecimal amount;
    private SplitCheckStatus status;
}
