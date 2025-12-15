package com.ffive.pos_system.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BusinessCreationRequest {
    private String ownerEmail;
    private String ownerName;
    private String businessName;
    private String address;
    private String contactInfo;
    private BusinessType businessType;
}
