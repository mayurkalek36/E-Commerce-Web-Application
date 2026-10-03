package com.shopstack.controller;

import com.shopstack.dto.OrderDtos.PlaceOrderRequest;
import com.shopstack.model.*;
import com.shopstack.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final PaymentRepository paymentRepository;

    public OrderController(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                            CartItemRepository cartItemRepository, ProductRepository productRepository,
                            CouponRepository couponRepository, PaymentRepository paymentRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody PlaceOrderRequest req) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(req.userId);
        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cart is empty"));
        }

        Payment payment = null;
        if (req.transactionId != null && !req.transactionId.isBlank()) {
            payment = paymentRepository.findByTransactionId(req.transactionId).orElse(null);
            if (payment == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unknown payment transaction"));
            }
            if (payment.getStatus() != PaymentStatus.SUCCESS) {
                return ResponseEntity.badRequest().body(Map.of("error", "Payment was not successful — cannot place order"));
            }
        } else if (!"cod".equals(req.paymentMethod)) {
            return ResponseEntity.badRequest().body(Map.of("error", "A successful payment transaction is required"));
        }

        double subtotal = 0;
        for (CartItem ci : cartItems) {
            Product p = productRepository.findById(ci.getProductId()).orElse(null);
            if (p != null) subtotal += p.getPrice() * ci.getQuantity();
        }

        double discountPercent = 0;
        if (req.couponCode != null && !req.couponCode.isBlank()) {
            discountPercent = couponRepository.findByCodeIgnoreCase(req.couponCode)
                    .filter(Coupon::isActive)
                    .map(Coupon::getDiscountPercent)
                    .orElse(0.0);
        }
        double discount = subtotal * (discountPercent / 100.0);

        DeliveryOption delivery = DeliveryOption.fromKeyOrDefault(req.deliveryOption);

        Order order = new Order();
        order.setUserId(req.userId);
        order.setTotalAmount(subtotal - discount + delivery.getFee());
        order.setDiscount(discount);
        order.setPaymentMethod(req.paymentMethod);
        order.setTransactionId(req.transactionId != null ? req.transactionId : "COD-" + System.currentTimeMillis());
        order.setDeliveryOption(delivery.getLabel());
        order.setDeliveryFee(delivery.getFee());
        order.setShippingAddress(req.shippingAddress);
        order.setStatus(OrderStatus.CONFIRMED);
        order = orderRepository.save(order);

        if (payment != null) {
            payment.setOrderId(order.getId());
            paymentRepository.save(payment);
        }

        for (CartItem ci : cartItems) {
            Product p = productRepository.findById(ci.getProductId()).orElse(null);
            if (p == null) continue;
            orderItemRepository.save(new OrderItem(
                    order.getId(), p.getId(), p.getVendorId(), p.getName(), ci.getQuantity(), p.getPrice()));
            p.setStock(Math.max(0, p.getStock() - ci.getQuantity()));
            if (p.getStock() == 0) p.setStatus("OUT_OF_STOCK");
            productRepository.save(p);
        }

        cartItemRepository.deleteByUserId(req.userId);

        return ResponseEntity.ok(order);
    }

    @GetMapping("/user/{userId}")
    public List<Order> byUser(@PathVariable Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @GetMapping("/{orderId}/items")
    public List<OrderItem> items(@PathVariable Long orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }

    @GetMapping("/vendor/{vendorId}")
    public List<OrderItem> byVendor(@PathVariable Long vendorId) {
        return orderItemRepository.findByVendorId(vendorId);
    }

    @GetMapping
    public List<Order> all() {
        return orderRepository.findAll();
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long orderId, @RequestBody Map<String, String> body) {
        return orderRepository.findById(orderId).map(o -> {
            o.setStatus(OrderStatus.valueOf(body.get("status").toUpperCase()));
            return ResponseEntity.ok(orderRepository.save(o));
        }).orElse(ResponseEntity.notFound().build());
    }
}