package com.shopstack.controller;

import com.shopstack.model.Address;
import com.shopstack.repository.AddressRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressRepository addressRepository;

    public AddressController(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    @GetMapping("/user/{userId}")
    public List<Address> byUser(@PathVariable Long userId) {
        return addressRepository.findByUserId(userId);
    }

    @PostMapping
    public Address create(@RequestBody Address address) {
        address.setId(null);
        return addressRepository.save(address);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!addressRepository.existsById(id)) return ResponseEntity.notFound().build();
        addressRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("deleted", true));
    }
}