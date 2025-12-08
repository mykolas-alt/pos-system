package com.ffive.pos_system.model;

import java.util.List;
import java.util.UUID;

import org.hibernate.envers.Audited;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
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
@Audited
public class Business {

    @Id
    @GeneratedValue
    @Schema(hidden = true)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "owner_id")
    @Schema(hidden = true)
    private Employee owner;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(name = "contact_info", nullable = false)
    private String contactInfo;

    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL, orphanRemoval = true)
    @Schema(hidden = true)
    private List<Employee> employees;

    public Business() {
    }
}
