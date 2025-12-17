package com.ffive.pos_system.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@Entity
@AllArgsConstructor(access = lombok.AccessLevel.PRIVATE)
@Table(name = "userrole")
public class UserRole {

    @Id
    @Column(name = "id")
    private byte id;

    @Enumerated(EnumType.STRING)
    @Column(name = "roletype", nullable = false, unique = true)
    private UserRoleType roleType;

    @NotNull
    private String name;
    @NotNull
    private String description;

    public UserRole() {
    }
}
