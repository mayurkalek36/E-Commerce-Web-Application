package com.shopstack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shopstack.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
}
