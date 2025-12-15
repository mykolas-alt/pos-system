package com.ffive.pos_system.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ffive.pos_system.model.POSService;

public interface ServiceRepository extends JpaRepository<POSService, UUID> {
	@Query("""
                SELECT s from POSService s
                WHERE s.business.id = :businessId
                AND s.isActive = true
                """)
        public List<POSService> findAllByBusiness(@Param("businessId") UUID businessId);
        
        @Query("""
                SELECT s from POSService s
                WHERE s.id = :serviceId AND s.business.id = :businessId
                AND s.isActive = true
                """)
        public List<POSService> findByIdAndBusiness(@Param("serviceId") UUID serviceId, @Param("businessId") UUID businessId);

   
    }
