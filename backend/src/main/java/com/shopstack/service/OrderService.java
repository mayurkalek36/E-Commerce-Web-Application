package com.shopstack.service;

import com.shopstack.dto.OrderDtos.PlaceOrderRequest;
import com.shopstack.model.*;
import com.shopstack.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final PaymentRepository paymentRepository;

    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                         CartItemRepository cartItemRepository, ProductRepository productRepository,
                         CouponRepository couponRepository, PaymentRepository paymentRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
        this.paymentRepository = paymentRepository;
    }

    /** Converts the user's current cart into a placed order, decrements stock, and empties the cart.
     *  Requires a successful payment transaction (see PaymentController / RazorpayController)
     *  unless paying by COD. @Transactional lives here because this is where the cart-clearing
     *  delete query actually runs — it needs an active transaction to execute. */
    @Transactional
    public Order placeOrderFromCart(PlaceOrderRequest req) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(req.userId);
        if (cartItems.isEmpty()) {
            throw new OrderPlacementException("Cart is empty");
        }

        Payment payment = null;
        if (req.transactionId != null && !req.transactionId.isBlank()) {
            payment = paymentRepository.findByTransactionId(req.transactionId).orElse(null);
            if (payment == null) {
                throw new OrderPlacementException("Unknown payment transaction");
            }
            if (payment.getStatus() != PaymentStatus.SUCCESS) {
                throw new OrderPlacementException("Payment was not successful — cannot place order");
            }
        } else if (!"cod".equals(req.paymentMethod)) {
            throw new OrderPlacementException("A successful payment transaction is required");
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

        Order order = new Order();
        order.setUserId(req.userId);
        order.setTotalAmount(subtotal - discount);
        order.setDiscount(discount);
        order.setPaymentMethod(req.paymentMethod);
        order.setTransactionId(req.transactionId != null ? req.transactionId : "COD-" + System.currentTimeMillis());
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

        return order;
    }
}