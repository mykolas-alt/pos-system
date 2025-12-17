package com.ffive.pos_system.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class AuthorizationHelper {

    public boolean hasEmployee(Authentication authentication) {
        POSUserDetails userDetails = (POSUserDetails) authentication.getPrincipal();
        return userDetails.getUser() != null && userDetails.getUser().getEmployee() != null;
    }

    public boolean isAuthenticated(Authentication authentication) {
        POSUserDetails userDetails = (POSUserDetails) authentication.getPrincipal();
        return userDetails != null && userDetails.getUser() != null;
    }

    public boolean isSuperAdminOrBusinessOwner(Authentication authentication) {
        POSUserDetails userDetails = (POSUserDetails) authentication.getPrincipal();
        return userDetails != null
                && userDetails.getUser() != null
                && (userDetails.getUser().isSuperAdmin() || userDetails.getUser().isBusinessOwner());
    }
}
