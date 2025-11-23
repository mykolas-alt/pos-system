package com.ffive.pos_system.security;

import java.util.Collection;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
@Builder
public class POSUserDetails implements UserDetails {

    private final String username;
    private final String password;
    private final UUID employeeId;
    private final Collection<? extends GrantedAuthority> authorities;
}
