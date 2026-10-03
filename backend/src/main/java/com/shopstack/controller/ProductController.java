package com.shopstack.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.model.Product;
import com.shopstack.repository.ProductRepository;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<Product> all(@RequestParam(required = false) String category,
                              @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return productRepository.findByNameContainingIgnoreCase(search);
        }
        if (category != null && !category.isBlank() && !category.equalsIgnoreCase("all")) {
            return productRepository.findByCategoryIgnoreCase(category);
        }
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> get(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/vendor/{vendorId}")
    public List<Product> byVendor(@PathVariable Long vendorId) {
        return productRepository.findByVendorId(vendorId);
    }

    @PostMapping
    public Product create(@RequestBody Product product) {
        product.setId(null);
        if (product.getStock() <= 0) {
            product.setStatus("OUT_OF_STOCK");
        } else {
            product.setStatus("PENDING_APPROVAL");
        }
        return productRepository.save(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product updated) {
        return productRepository.findById(id).map(p -> {
            p.setName(updated.getName());
            p.setCategory(updated.getCategory());
            p.setDescription(updated.getDescription());
            p.setPrice(updated.getPrice());
            p.setMrp(updated.getMrp());
            p.setStock(updated.getStock());
            if (p.getStock() <= 0) p.setStatus("OUT_OF_STOCK");
            return ResponseEntity.ok(productRepository.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        return productRepository.findById(id).map(p -> {
            p.setStatus(p.getStock() > 0 ? "LIVE" : "OUT_OF_STOCK");
            return ResponseEntity.ok(productRepository.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!productRepository.existsById(id)) return ResponseEntity.notFound().build();
        productRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("deleted", true));
    }
}
