package com.ffive.pos_system.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import com.ffive.pos_system.model.ReservationStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReservationResponse {
    private UUID id;    
    private UUID serviceId;
    private LocalDateTime apointmentTime;
    private String customerName;
    private ReservationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime closedAt; 
}

