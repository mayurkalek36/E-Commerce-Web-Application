package com.shopstack.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.dto.CartDtos.AddToCartRequest;
import com.shopstack.dto.CartDtos.UpdateQuantityRequest;
import com.shopstack.model.CartItem;
import com.shopstack.model.Product;
import com.shopstack.repository.CartItemRepository;
import com.shopstack.repository.ProductRepository;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartController(CartItemRepository cartItemRepository, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    // Returns cart items enriched with live product data (name, price, image color, vendor)
    @GetMapping("/{userId}")
    public List<Map<String, Object>> getCart(@PathVariable Long userId) {
        return cartItemRepository.findByUserId(userId).stream().map(item -> {
            Product p = productRepository.findById(item.getProductId()).orElse(null);
            return Map.<String, Object>of(
                    "cartItemId", item.getId(),
                    "productId", item.getProductId(),
                    "quantity", item.getQuantity(),
                    "name", p != null ? p.getName() : "Product removed",
                    "price", p != null ? p.getPrice() : 0,
                    "category", p != null ? p.getCategory() : ""
            );
        }).collect(Collectors.toList());
    }

    @PostMapping
    public CartItem addToCart(@RequestBody AddToCartRequest req) {
        return cartItemRepository.findByUserIdAndProductId(req.userId, req.productId)
                .map(existing -> {
                    existing.setQuantity(existing.getQuantity() + req.quantity);
                    return cartItemRepository.save(existing);
                })
                .orElseGet(() -> cartItemRepository.save(
                        new CartItem(req.userId, req.productId, Math.max(1, req.quantity))));
    }

    @PatchMapping("/item/{cartItemId}")
    public ResponseEntity<?> updateQuantity(@PathVariable Long cartItemId, @RequestBody UpdateQuantityRequest req) {
        return cartItemRepository.findById(cartItemId).map(item -> {
            if (req.quantity <= 0) {
                cartItemRepository.delete(item);
                return ResponseEntity.ok(Map.of("removed", true));
            }
            item.setQuantity(req.quantity);
            return ResponseEntity.ok(cartItemRepository.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<?> remove(@PathVariable Long cartItemId) {
        if (!cartItemRepository.existsById(cartItemId)) return ResponseEntity.notFound().build();
        cartItemRepository.deleteById(cartItemId);
        return ResponseEntity.ok(Map.of("removed", true));
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<?> clear(@PathVariable Long userId) {
        cartItemRepository.deleteByUserId(userId);
        return ResponseEntity.ok(Map.of("cleared", true));
    }
}
