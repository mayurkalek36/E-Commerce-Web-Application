package com.shopstack.controller;

import com.shopstack.dto.AuthDtos.LoginRequest;
import com.shopstack.dto.AuthDtos.RegisterRequest;
import com.shopstack.dto.AuthDtos.CheckEmailRequest;
import com.shopstack.dto.AuthDtos.ResetPasswordRequest;
import com.shopstack.model.Role;
import com.shopstack.model.User;
import com.shopstack.model.Vendor;
import com.shopstack.repository.UserRepository;
import com.shopstack.repository.VendorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;

    public AuthController(UserRepository userRepository, VendorRepository vendorRepository) {
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered"));
        }
        Role role;
        try {
            role = Role.valueOf(req.role.toUpperCase());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
        }

        User user = new User(req.name, req.email, req.password, role);
        user = userRepository.save(user);

        if (role == Role.VENDOR) {
            Vendor vendor = new Vendor(user.getId(),
                    req.businessName != null ? req.businessName : req.name + "'s Store",
                    "General");
            vendorRepository.save(vendor);
        }

        return ResponseEntity.ok(sanitize(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        return userRepository.findByEmail(req.email)
                .filter(u -> u.getPassword().equals(req.password))
                .<ResponseEntity<?>>map(u -> ResponseEntity.ok(sanitize(u)))
                .orElse(ResponseEntity.status(401).body(Map.of("error", "Invalid email or password")));
    }

    private Map<String, Object> sanitize(User u) {
        return Map.of(
                "id", u.getId(),
                "name", u.getName(),
                "email", u.getEmail(),
                "role", u.getRole().name()
        );
    }

    /** Step 1 of "forgot password" — confirms an account exists for this email before
     *  showing the reset form, so we can give a clear "no account found" message. */
    @PostMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestBody CheckEmailRequest req) {
        return userRepository.findByEmail(req.email)
                .<ResponseEntity<?>>map(u -> ResponseEntity.ok(Map.of(
                        "exists", true,
                        "name", u.getName(),
                        "role", u.getRole().name()
                )))
                .orElse(ResponseEntity.status(404).body(Map.of(
                        "exists", false,
                        "error", "No account found with that email address"
                )));
    }

    /** Step 2 of "forgot password" — sets a new password directly.
     *  NOTE: this is a demo-simplified flow with no email verification link, since this
     *  project has no email/SMS provider wired up. In production, this endpoint should only
     *  be reachable via a signed, time-limited token sent to the user's verified email. */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        if (req.newPassword == null || req.newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
        }
        return userRepository.findByEmail(req.email).<ResponseEntity<?>>map(u -> {
            u.setPassword(req.newPassword);
            userRepository.save(u);
            return ResponseEntity.ok(Map.of("reset", true));
        }).orElse(ResponseEntity.status(404).body(Map.of("error", "No account found with that email address")));
    }
}