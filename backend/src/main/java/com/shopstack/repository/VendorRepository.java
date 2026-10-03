package com.shopstack.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shopstack.model.Vendor;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
    Optional<Vendor> findByUserId(Long userId);
}
