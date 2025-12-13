package com.ffive.pos_system.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;


import com.ffive.pos_system.model.Reservation;
import com.ffive.pos_system.model.Business;



public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
    
    @Query("""
            SELECT r FROM Reservation r
            WHERE r.business.id = :businessId
            """)
    List<Reservation>findAllByBusinessId(UUID businessId);

    @Query("""
            SELECT r FROM Reservation r
            WHERE r.customerName = :customerName AND r.customerPhone = :customerPhone
            """)
    List<Reservation>findAllByCustomerId(String customerName, String customerPhone);


    @Query("""
            SELECT r from Reservation r
            WHERE r.id = :reservationId
            """)
    Reservation findByReservationId(UUID reservationId);
}
