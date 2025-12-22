package com.ffive.pos_system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ffive.pos_system.model.OrderItem;
import com.ffive.pos_system.model.Product;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    @Query("""
            SELECT oi FROM OrderItem oi
            WHERE oi.order.id = :orderId AND oi.product.id = :productId
            """)
    public Optional<OrderItem> findByOrderIdAndProductId(UUID orderId, UUID productId);

    @Query("""
            SELECT oi FROM OrderItem oi
            WHERE oi.order.id = :orderId
            """)
    public List<OrderItem> findByOrderId(UUID orderId);

    @Modifying
    @Query("DELETE FROM OrderItem oi WHERE oi.product = :product AND oi.order.status = 1") // 1 = OPEN
    void deleteAllByProductIfOrderOpen(@Param("product") Product product);
}
