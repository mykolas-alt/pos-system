package com.ffive.pos_system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.hibernate.cache.spi.support.AbstractReadWriteAccess.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ffive.pos_system.model.Product;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    @Query("""
            SELECT p FROM Product p
            WHERE p.id = :itemId AND p.business.id = :businessId
            """)
    Optional<Item> findByIdAndBusiness(@Param("itemId") UUID itemId,
            @Param("businessId") UUID businessId);

    @Query("""
            SELECT p FROM Product p
            WHERE p.business.id = :businessId
            """)
    List<Item> findAllByBusiness(@Param("businessId") UUID businessId);
}
