package com.shopstack.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "vendors")
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String businessName;

    private String category;

    @Enumerated(EnumType.STRING)
    private VendorStatus status = VendorStatus.PENDING;

    private double commissionRate = 8.0;

    public Vendor() {}

    public Vendor(Long userId, String businessName, String category) {
        this.userId = userId;
        this.businessName = businessName;
        this.category = category;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public VendorStatus getStatus() { return status; }
    public void setStatus(VendorStatus status) { this.status = status; }
    public double getCommissionRate() { return commissionRate; }
    public void setCommissionRate(double commissionRate) { this.commissionRate = commissionRate; }
}
