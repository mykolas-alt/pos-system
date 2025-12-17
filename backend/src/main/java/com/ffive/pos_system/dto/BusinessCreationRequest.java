package com.ffive.pos_system.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BusinessCreationRequest {
    @NotNull
    private String ownerEmail;
    @NotNull
    private String ownerName;
    @NotNull
    private String businessName;
    @NotNull
    private String address;
    @NotNull
    private String contactInfo;
    @NotNull
    private BusinessType businessType;
}
