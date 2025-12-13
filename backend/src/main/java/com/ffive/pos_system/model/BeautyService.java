package com.ffive.pos_system.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Audited
public class BeautyService {
    

    @Id
    @GeneratedValue
    @Schema(hidden = true)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "reservation_id", nullable = false)
    @Audited(targetAuditMode =  RelationTargetAuditMode.NOT_AUDITED)
    private Reservation reservation;

    @Schema(hidden = true)
    @ManyToOne
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn (name = "specialist_id", nullable = false)
    private Employee specialistId;

    @Column(nullable = false)
    private long duration;

    @Column(nullable = false)
    private LocalDateTime opensAt;

    @Column(nullable = false)
    private LocalDateTime closesAt;

    
    @Column(nullable = false)
    private BigDecimal price;

     // snapshot fields
    @Column(name = "beautyservice_name_snapshot")
    private String productNameSnapshot;

    @Column(name = "duration_price_snapshot")
    private BigDecimal unitPriceSnapshot;

    public BeautyService(String name, Employee specialist, long duration, LocalDateTime openAt, LocalDateTime closedAt, BigDecimal price) {
        this.name = name;
        this.specialistId = specialist;
        this.duration = duration;
        this.opensAt = openAt;
        this.closesAt = closedAt;
        this.price = price;
    }
    public BeautyService() {
    }

    @Override
    public String toString(){
        return name + " ($" + price + ")" + " " + opensAt + " - " + closesAt;
    }
}   
