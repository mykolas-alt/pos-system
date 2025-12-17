package com.ffive.pos_system.dto;

import lombok.Getter;

@Getter
public class LoginRequest {
    private final String username;
    private final String password;

    public LoginRequest(String password, String username) {
        this.password = password;
        this.username = username;
    }
}
