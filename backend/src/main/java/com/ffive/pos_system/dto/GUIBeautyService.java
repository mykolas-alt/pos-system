package com.ffive.pos_system.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GUIBeautyService {
    
    private UUID id;
    private String name;
    private UUID specialistId;
    private long duration;
    private LocalDateTime opensAt;
    private LocalDateTime closesAt;
    private BigDecimal price;
}
