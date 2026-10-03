package com.shopstack.dto;

public class PaymentDtos {

    public static class ProcessPaymentRequest {
        public Long userId;
        public double amount;
        public String method;       // card, upi, netbanking, wallet, cod
        public String cardNumber;   // only for method = card
        public String cardName;
        public String cardExpiry;
        public String cardCvv;
        public String upiId;        // only for method = upi
    }

    public static class LinkOrderRequest {
        public Long orderId;
    }
}