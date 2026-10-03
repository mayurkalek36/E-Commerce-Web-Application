package com.shopstack.model;

public enum DeliveryOption {
    STANDARD("Standard delivery", 0, "5-7 business days"),
    FAST("Fast delivery", 49, "3-5 business days"),
    EXTREME("Extreme fast delivery", 149, "Next day delivery");

    private final String label;
    private final double fee;
    private final String eta;

    DeliveryOption(String label, double fee, String eta) {
        this.label = label;
        this.fee = fee;
        this.eta = eta;
    }

    public String getLabel() { return label; }
    public double getFee() { return fee; }
    public String getEta() { return eta; }

    public static DeliveryOption fromKeyOrDefault(String key) {
        if (key == null || key.isBlank()) return STANDARD;
        try {
            return DeliveryOption.valueOf(key.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return STANDARD;
        }
    }
}