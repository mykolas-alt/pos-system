package com.ffive.pos_system.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ffive.pos_system.model.BeautyService;

public interface BeautyServiceRepository extends JpaRepository<BeautyService, UUID> {
		@Query("""
                SELECT bs from BeautyService bs
                WHERE bs.business.id = :businessId
                """)
        public List<BeautyService> findAllByBusiness(@Param("businessId") UUID businessId);
        
        @Query("""
                SELECT bs from BeautyService bs
                WHERE bs.id = :serviceId AND bs.business.id = :businessId
                """)
        public List<BeautyService> findByIdAndBusiness(@Param("serviceId") UUID serviceId, @Param("businessId") UUID businessId);

        @Query("""
                SELECT bs from BeautyService bs
                WHERE bs.id = :serviceId
                """)
        public BeautyService findByServiceId(UUID serviceId);

    }
