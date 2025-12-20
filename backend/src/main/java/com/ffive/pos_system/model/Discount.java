package com.ffive.pos_system.model;

import java.math.BigDecimal;
import java.util.UUID;

import org.hibernate.envers.Audited;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Audited
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Discount {
    @Id
    @GeneratedValue
    private UUID id;

    private String name;

    private BigDecimal rate;

    @Column(name = "business_id", nullable = false)
    private UUID businessId;

    @Enumerated(EnumType.STRING)
    private DiscountType type;

    private Boolean active;
}
