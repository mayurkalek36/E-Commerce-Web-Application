package com.shopstack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shopstack.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);
    List<OrderItem> findByVendorId(Long vendorId);
}
