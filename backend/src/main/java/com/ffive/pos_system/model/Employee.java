package com.ffive.pos_system.model;

import java.util.UUID;

import org.hibernate.envers.Audited;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Builder
@Audited
@AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue
    @Schema(hidden = true)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "business_id")
    @Schema(hidden = true)
    private Business business;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @ManyToOne
    @JoinColumn(name = "manager_id")
    private Employee manager;

    public Employee() {
    }
}
