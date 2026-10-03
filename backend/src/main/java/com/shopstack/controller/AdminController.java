package com.shopstack.controller;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.model.Order;
import com.shopstack.model.Vendor;
import com.shopstack.model.VendorStatus;
import com.shopstack.repository.OrderRepository;
import com.shopstack.repository.ProductRepository;
import com.shopstack.repository.VendorRepository;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final VendorRepository vendorRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public AdminController(VendorRepository vendorRepository, OrderRepository orderRepository,
                            ProductRepository productRepository) {
        this.vendorRepository = vendorRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/overview")
    public Map<String, Object> overview() {
        List<Order> orders = orderRepository.findAll();
        double gmv = orders.stream().mapToDouble(Order::getTotalAmount).sum();
        long activeVendors = vendorRepository.findAll().stream()
                .filter(v -> v.getStatus() == VendorStatus.APPROVED).count();
        long pendingVendors = vendorRepository.findAll().stream()
                .filter(v -> v.getStatus() == VendorStatus.PENDING).count();

        return Map.of(
                "gmv", gmv,
                "totalOrders", orders.size(),
                "activeVendors", activeVendors,
                "pendingVendorApprovals", pendingVendors,
                "totalProducts", productRepository.count()
        );
    }

    @GetMapping("/vendors/pending")
    public List<Vendor> pendingVendors() {
        return vendorRepository.findAll().stream()
                .filter(v -> v.getStatus() == VendorStatus.PENDING)
                .toList();
    }
}
