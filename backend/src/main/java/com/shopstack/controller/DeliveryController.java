package com.shopstack.controller;

import com.shopstack.model.DeliveryOption;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/delivery-options")
public class DeliveryController {

    @GetMapping
    public List<Map<String, Object>> list() {
        return Arrays.stream(DeliveryOption.values())
                .map(d -> Map.<String, Object>of(
                        "key", d.name(),
                        "label", d.getLabel(),
                        "fee", d.getFee(),
                        "eta", d.getEta()
                ))
                .toList();
    }
}