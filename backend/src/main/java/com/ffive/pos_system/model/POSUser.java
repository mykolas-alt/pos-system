package com.ffive.pos_system.model;

import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Transient;
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

    @Transient
    private String password;

    @Column(nullable = false)
    @Schema(hidden = true)
    private String passwordHash;

    public POSUser() {
    }
}
