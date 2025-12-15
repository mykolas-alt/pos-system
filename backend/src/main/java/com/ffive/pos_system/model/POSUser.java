package com.ffive.pos_system.model;

import static jakarta.persistence.FetchType.EAGER;

import java.util.List;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
public class POSUser {

    @Id
    @GeneratedValue
    @Schema(hidden = true)
    private UUID id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    @Schema(hidden = true)
    private String passwordHash;

    @OneToOne(fetch = EAGER)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @ManyToMany(fetch = EAGER)
    @JoinTable(name = "userroleassignment", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private List<UserRole> roles;

    public POSUser() {
    }

    public boolean isSuperAdmin() {
        return roles.stream()
                .anyMatch(role -> role.getRoleType() == UserRoleType.SUPER_ADMIN);
    }

    public boolean isBusinessOwner() {
        return roles.stream()
                .anyMatch(role -> role.getRoleType() == UserRoleType.BUSINESS_OWNER);
    }

    public boolean isEmployee() {
        return roles.stream()
                .anyMatch(role -> role.getRoleType() == UserRoleType.EMPLOYEE);
    }
}
