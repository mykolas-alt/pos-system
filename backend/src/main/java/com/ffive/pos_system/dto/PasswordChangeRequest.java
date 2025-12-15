package com.ffive.pos_system.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PasswordChangeRequest {

    @NotNull
    private String oldPassword;
    @NotNull
    private String newPassword;
}
