package com.shopstack.controller;

import com.shopstack.dto.PaymentDtos.ProcessPaymentRequest;
import com.shopstack.model.Payment;
import com.shopstack.model.PaymentStatus;
import com.shopstack.repository.PaymentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Simulated payment gateway used for Cash on Delivery (and as a fallback demo path).
 * Online payments (card/UPI/netbanking/wallet) instead go through RazorpayController,
 * which talks to Razorpay's real test-mode gateway and writes SUCCESS rows into this
 * same payments table. This controller performs realistic input validation and records
 * every attempt, but never contacts a real bank or card network on its own.
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentRepository paymentRepository;

    private static final Pattern CARD_PATTERN = Pattern.compile("^\\d{12,19}$");
    private static final Pattern EXPIRY_PATTERN = Pattern.compile("^(0[1-9]|1[0-2])/\\d{2}$");
    private static final Pattern CVV_PATTERN = Pattern.compile("^\\d{3,4}$");
    private static final Pattern UPI_PATTERN = Pattern.compile("^[\\w.\\-]{2,}@[a-zA-Z]{2,}$");

    public PaymentController(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @PostMapping("/process")
    public ResponseEntity<?> process(@RequestBody ProcessPaymentRequest req) {
        if (req.amount <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid amount"));
        }

        Payment payment = new Payment();
        payment.setUserId(req.userId);
        payment.setAmount(req.amount);
        payment.setMethod(req.method);
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase());

        String validationError = validate(req);
        if (validationError != null) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(validationError);
            paymentRepository.save(payment);
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "FAILED",
                    "error", validationError,
                    "transactionId", payment.getTransactionId()
            ));
        }

        payment.setMaskedDetail(maskDetail(req));

        // Simulate gateway processing latency, like a real network call to a bank/card network.
        try { Thread.sleep(600); } catch (InterruptedException ignored) { Thread.currentThread().interrupt(); }

        payment.setStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "transactionId", payment.getTransactionId(),
                "amount", payment.getAmount(),
                "method", payment.getMethod(),
                "maskedDetail", payment.getMaskedDetail()
        ));
    }

    private String validate(ProcessPaymentRequest req) {
        if (req.method == null) return "Payment method is required";
        switch (req.method) {
            case "card":
                if (req.cardNumber == null || !CARD_PATTERN.matcher(req.cardNumber.replaceAll("\\s", "")).matches())
                    return "Enter a valid 12-19 digit card number";
                if (req.cardExpiry == null || !EXPIRY_PATTERN.matcher(req.cardExpiry.trim()).matches())
                    return "Enter a valid expiry date (MM/YY)";
                if (req.cardCvv == null || !CVV_PATTERN.matcher(req.cardCvv.trim()).matches())
                    return "Enter a valid CVV";
                if (req.cardName == null || req.cardName.isBlank())
                    return "Enter the name on the card";
                if (!luhnCheck(req.cardNumber.replaceAll("\\s", "")))
                    return "Card number failed validation checksum";
                break;
            case "upi":
                if (req.upiId == null || !UPI_PATTERN.matcher(req.upiId.trim()).matches())
                    return "Enter a valid UPI ID (e.g. name@bank)";
                break;
            case "netbanking":
            case "wallet":
            case "cod":
                break; // no extra fields required for this demo gateway
            default:
                return "Unsupported payment method";
        }
        return null;
    }

    private boolean luhnCheck(String cardNumber) {
        int sum = 0;
        boolean alternate = false;
        for (int i = cardNumber.length() - 1; i >= 0; i--) {
            int n = Character.getNumericValue(cardNumber.charAt(i));
            if (alternate) {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sum += n;
            alternate = !alternate;
        }
        return sum % 10 == 0;
    }

    private String maskDetail(ProcessPaymentRequest req) {
        if ("card".equals(req.method) && req.cardNumber != null) {
            String digits = req.cardNumber.replaceAll("\\s", "");
            return "**** **** **** " + digits.substring(digits.length() - 4);
        }
        if ("upi".equals(req.method)) return req.upiId;
        return req.method;
    }

    @GetMapping("/user/{userId}")
    public List<Payment> history(@PathVariable Long userId) {
        return paymentRepository.findAll().stream()
                .filter(p -> p.getUserId() != null && p.getUserId().equals(userId))
                .toList();
    }
}