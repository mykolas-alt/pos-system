package com.ffive.pos_system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.ffive.pos_system.model.Reservation;
import com.ffive.pos_system.model.OrderStatus;



public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
    
    @Query("""
            SELECT r FROM Reservation r
            WHERE r.business.id = :businessId
            """)
    List<Reservation> findAllByBusinessId(UUID businessId);

    @Query("""
            SELECT r FROM Reservation r
            WHERE r.customerName = :customerName AND r.customerPhone = :customerPhone
            AND r.status NOT IN (3, 4)
            """)
    List<Reservation>findAllByCustomer(String customerName, String customerPhone);


    @Query("""
            SELECT r FROM Reservation r
            WHERE r.id = :reservationId
            AND r.status NOT IN (3, 4)
            """)
    Optional<Reservation> findByReservationId(UUID reservationId);
}
