package com.ffive.pos_system.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import com.ffive.pos_system.model.OrderStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReservationRequest {
    private UUID employeeId;
    private UUID serviceId;
    private LocalDateTime apointmentTime;
    private String customerName;
    private String customerPhone;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime closedAt; 
    
}
