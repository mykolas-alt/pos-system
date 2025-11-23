package com.ffive.pos_system.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.ffive.pos_system.model.POSUser;
import com.ffive.pos_system.repository.EmployeeRepository;
import com.ffive.pos_system.repository.UserRepository;
import com.ffive.pos_system.security.POSUserDetails;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class POSUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        POSUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return POSUserDetails.builder()
                .username(user.getUsername())
                .password(user.getPasswordHash())
                .employeeId(employeeRepository.findByUserId(user.getId())
                        .map(emp -> emp.getId())
                        .orElse(null))
                .build();
    }
}
