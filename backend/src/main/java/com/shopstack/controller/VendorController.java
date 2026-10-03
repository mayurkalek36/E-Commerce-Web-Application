package com.shopstack.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.model.OrderItem;
import com.shopstack.model.Vendor;
import com.shopstack.model.VendorStatus;
import com.shopstack.repository.OrderItemRepository;
import com.shopstack.repository.VendorRepository;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final VendorRepository vendorRepository;
    private final OrderItemRepository orderItemRepository;

    public VendorController(VendorRepository vendorRepository, OrderItemRepository orderItemRepository) {
        this.vendorRepository = vendorRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @GetMapping
    public List<Vendor> all() {
        return vendorRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vendor> get(@PathVariable Long id) {
        return vendorRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Vendor> byUser(@PathVariable Long userId) {
        return vendorRepository.findByUserId(userId).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    /** Simple sales summary used for the vendor dashboard's overview + payouts panels. */
    @GetMapping("/{id}/summary")
    public Map<String, Object> summary(@PathVariable Long id) {
        List<OrderItem> items = orderItemRepository.findByVendorId(id);
        double gross = items.stream().mapToDouble(i -> i.getPrice() * i.getQuantity()).sum();
        Vendor vendor = vendorRepository.findById(id).orElse(null);
        double commissionRate = vendor != null ? vendor.getCommissionRate() : 8.0;
        double commission = gross * (commissionRate / 100.0);
        return Map.of(
                "vendorId", id,
                "totalOrders", items.size(),
                "grossSales", gross,
                "commissionRate", commissionRate,
                "commissionAmount", commission,
                "netPayout", gross - commission
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> setStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return vendorRepository.findById(id).map(v -> {
            v.setStatus(VendorStatus.valueOf(body.get("status").toUpperCase()));
            return ResponseEntity.ok(vendorRepository.save(v));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/commission")
    public ResponseEntity<?> setCommission(@PathVariable Long id, @RequestBody Map<String, Double> body) {
        return vendorRepository.findById(id).map(v -> {
            v.setCommissionRate(body.get("commissionRate"));
            return ResponseEntity.ok(vendorRepository.save(v));
        }).orElse(ResponseEntity.notFound().build());
    }
}
