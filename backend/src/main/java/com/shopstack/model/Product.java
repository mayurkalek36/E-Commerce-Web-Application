package com.shopstack.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long vendorId;

    private String name;

    private String category;

    private String description;

    private double price;

    private double mrp;

    private int stock;

    private double rating = 4.0;

    private String status = "LIVE"; // LIVE, PENDING_APPROVAL, OUT_OF_STOCK

    public Product() {}

    public Product(Long vendorId, String name, String category, String description,
                    double price, double mrp, int stock) {
        this.vendorId = vendorId;
        this.name = name;
        this.category = category;
        this.description = description;
        this.price = price;
        this.mrp = mrp;
        this.stock = stock;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public double getMrp() { return mrp; }
    public void setMrp(double mrp) { this.mrp = mrp; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
