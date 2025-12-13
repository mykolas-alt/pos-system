package com.ffive.pos_system.dto;

import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeCreationRequest {
    private String name;
    private String email;
    private String password;
    private UUID managerId;
    private UUID businessId;

    public EmployeeCreationRequest() {
    }
}
