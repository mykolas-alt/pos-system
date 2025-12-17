package com.ffive.pos_system.security;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.ffive.pos_system.model.POSUser;

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
    private final POSUser user;
    private final Collection<? extends GrantedAuthority> authorities;
}
