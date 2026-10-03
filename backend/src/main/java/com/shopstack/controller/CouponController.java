package com.shopstack.controller;

import com.shopstack.model.Coupon;
import com.shopstack.repository.CouponRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponRepository couponRepository;

    public CouponController(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @GetMapping("/validate/{code}")
    public ResponseEntity<?> validate(@PathVariable String code) {
        return couponRepository.findByCodeIgnoreCase(code)
                .filter(Coupon::isActive)
                .<ResponseEntity<?>>map(c -> ResponseEntity.ok(Map.of(
                        "valid", true,
                        "code", c.getCode(),
                        "discountPercent", c.getDiscountPercent()
                )))
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of(
                        "valid", false,
                        "error", "Invalid or expired coupon code"
                )));
    }
}