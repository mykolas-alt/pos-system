package com.ffive.pos_system.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

import javax.management.MXBean;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

@Entity
@Getter
@Setter
@Audited
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Reservation{


    @Id
    @GeneratedValue
    @Schema(hidden = true)
    private UUID id;
        
    @ManyToOne
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;


    @ManyToOne
    @JoinColumn(name = "service_id", nullable = false)
    private POSService service;
      
    @NotAudited
    @OneToMany(mappedBy = "reservation", fetch = FetchType.LAZY)
    private List<ReservationTax> taxes;

    @NotAudited
    @OneToMany(mappedBy = "reservation", fetch = FetchType.LAZY)
    private List<ReservationDiscount> discounts;

    @Column(nullable = false)
    private LocalDateTime apointmentTime;


    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerPhone;

    @Column(nullable = false)
    private ReservationStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime closedAt;

    @Column(nullable = false)
    private BigDecimal totalAmount;
    
    @Override
    public String toString() {
        return "Reservation [id=" + id + ", business=" + business + ", apointmentTime="
                + apointmentTime + ", customerName=" + customerName + ", customerPhone=" + customerPhone + ", status="
                + status + ", createdAt=" + createdAt + ", closedAt=" + closedAt + "]";
    }

}