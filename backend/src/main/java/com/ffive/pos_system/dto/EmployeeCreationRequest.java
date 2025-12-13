package com.ffive.pos_system.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeCreationRequest {
    @NotNull
    private String name;
    @NotNull
    private String email;
    @NotNull
    private String password;
    private UUID managerId;

    public EmployeeCreationRequest() {
    }
}
