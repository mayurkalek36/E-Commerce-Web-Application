package com.shopstack.dto;

public class OrderDtos {

    public static class PlaceOrderRequest {
        public Long userId;
        public String shippingAddress;
        public String paymentMethod;
        public String couponCode;
        public String transactionId;
        public String deliveryOption; // "STANDARD" | "FAST" | "EXTREME" — fee is looked up server-side, not trusted from the client
    }
}