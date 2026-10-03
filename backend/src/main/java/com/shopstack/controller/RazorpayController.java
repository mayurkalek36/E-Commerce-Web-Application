package com.shopstack.controller;

import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.shopstack.model.PaymentStatus;
import com.shopstack.repository.PaymentRepository;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Real integration with Razorpay's payment gateway, running in TEST MODE.
 * No real money moves — Razorpay's own test keys and test card/UPI numbers simulate
 * a genuine bank/card-network round trip, including their real checkout widget UI,
 * card validation, and payment signature verification.
 *
 * Setup: sign up free at https://dashboard.razorpay.com, switch to Test Mode,
 * go to Settings -> API Keys -> Generate Test Key, and paste the Key Id / Key Secret
 * into application.properties (razorpay.key.id / razorpay.key.secret).
 */
@RestController
@RequestMapping("/api/razorpay")
public class RazorpayController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private final PaymentRepository paymentRepository;

    public RazorpayController(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    /** Step 1: server creates a Razorpay order so the amount can't be tampered with client-side. */
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            double amountRupees = Double.parseDouble(body.get("amount").toString());

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", Math.round(amountRupees * 100)); // Razorpay works in paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_" + System.currentTimeMillis());

            com.razorpay.Order order = client.orders.create(orderRequest);

            Map<String, Object> res = new HashMap<>();
            res.put("orderId", order.get("id").toString());
            res.put("amount", order.get("amount"));
            res.put("currency", order.get("currency"));
            res.put("keyId", keyId);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Could not create Razorpay order — check that razorpay.key.id / razorpay.key.secret are set correctly in application.properties. Details: " + e.getMessage()
            ));
        }
    }

    /** Step 2: after the widget completes, verify the cryptographic signature Razorpay returns,
     *  then record it as a SUCCESS payment in our own Payment table (same table PaymentController
     *  uses), so OrderController's existing transactionId check works unchanged. */
    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody Map<String, String> body) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", body.get("razorpay_order_id"));
            options.put("razorpay_payment_id", body.get("razorpay_payment_id"));
            options.put("razorpay_signature", body.get("razorpay_signature"));

            boolean valid = Utils.verifyPaymentSignature(options, keySecret);
            if (!valid) {
                return ResponseEntity.status(400).body(Map.of("verified", false, "error", "Signature verification failed"));
            }

            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            com.razorpay.Payment rpPayment = client.payments.fetch(body.get("razorpay_payment_id"));

            String method = safeGet(rpPayment, "method", "razorpay");
            double amount = Double.parseDouble(rpPayment.get("amount").toString()) / 100.0;

            com.shopstack.model.Payment payment = new com.shopstack.model.Payment();
            payment.setUserId(Long.valueOf(body.get("userId")));
            payment.setAmount(amount);
            payment.setMethod(method);
            payment.setTransactionId(body.get("razorpay_payment_id"));
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setMaskedDetail("Razorpay (" + method + ")");
            paymentRepository.save(payment);

            return ResponseEntity.ok(Map.of(
                    "verified", true,
                    "transactionId", payment.getTransactionId(),
                    "method", method
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("verified", false, "error", e.getMessage()));
        }
    }

    private String safeGet(com.razorpay.Payment payment, String key, String fallback) {
        try {
            Object v = payment.get(key);
            return v != null ? v.toString() : fallback;
        } catch (Exception e) {
            return fallback;
        }
    }
}