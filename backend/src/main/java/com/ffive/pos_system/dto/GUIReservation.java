package com.ffive.pos_system.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import java.math.BigDecimal;
import com.ffive.pos_system.model.OrderStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder

public class GUIReservation {
    
    private UUID id;
    private UUID businessId;
    private UUID serviceId;
    private LocalDateTime apointmentTime;
    private String customerName;
    private String customerPhone;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime closedAt; 
    
}
