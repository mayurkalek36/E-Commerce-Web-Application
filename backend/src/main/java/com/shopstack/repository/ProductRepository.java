package com.shopstack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shopstack.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByVendorId(Long vendorId);
    List<Product> findByCategoryIgnoreCase(String category);
    List<Product> findByNameContainingIgnoreCase(String name);
}
