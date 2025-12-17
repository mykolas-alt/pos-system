package com.ffive.pos_system.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Audited
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "service", schema = "pos")
public class POSService {

    @Id
    @GeneratedValue
    @Schema(hidden = true)
    private UUID id;

    
    @Schema(hidden = true)
    @ManyToOne
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn (name = "specialist_id", nullable = false)
    private Employee specialist;

    @Column(nullable = false)
    private long duration;

    @Column(nullable = false)
    private LocalDateTime opensAt;

    @Column(nullable = false)
    private LocalDateTime closesAt;

    
    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Override
    public String toString(){
        return name + " ($" + price + ")" + " " + opensAt + " - " + closesAt;
    }
}   
