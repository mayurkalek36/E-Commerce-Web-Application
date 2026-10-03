package com.shopstack;

import com.shopstack.model.*;
import com.shopstack.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final AddressRepository addressRepository;

    public DataSeeder(UserRepository userRepository, VendorRepository vendorRepository,
                       ProductRepository productRepository, CouponRepository couponRepository,
                       AddressRepository addressRepository) {
        this.userRepository = userRepository;
        this.vendorRepository = vendorRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
        this.addressRepository = addressRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return; // already seeded

        User customer = userRepository.save(new User("Priya Sharma", "priya@example.com", "password123", Role.CUSTOMER));
        User admin = userRepository.save(new User("Admin User", "admin@shopstack.com", "admin123", Role.ADMIN));
        User warehouse = userRepository.save(new User("Warehouse Staff", "warehouse@shopstack.com", "warehouse123", Role.WAREHOUSE));

        User nimbusUser = userRepository.save(new User("Nimbus Owner", "nimbus@vendor.com", "vendor123", Role.VENDOR));
        User trailUser = userRepository.save(new User("Trail Owner", "trail@vendor.com", "vendor123", Role.VENDOR));
        User verveUser = userRepository.save(new User("Verve Owner", "verve@vendor.com", "vendor123", Role.VENDOR));

        Vendor nimbus = new Vendor(nimbusUser.getId(), "Nimbus Audio", "Electronics");
        nimbus.setStatus(VendorStatus.APPROVED);
        nimbus = vendorRepository.save(nimbus);

        Vendor trail = new Vendor(trailUser.getId(), "Trail & Co Footwear", "Fashion");
        trail.setStatus(VendorStatus.APPROVED);
        trail = vendorRepository.save(trail);

        Vendor verve = new Vendor(verveUser.getId(), "Verve Home Essentials", "Home & Kitchen");
        verve.setStatus(VendorStatus.PENDING);
        verve = vendorRepository.save(verve);

        seedProduct(nimbus.getId(), "Nimbus Audio WaveMax Wireless Headphones", "Electronics",
                "40-hour battery, active noise cancellation, Bluetooth 5.3.", 3499, 5999, 142, "LIVE");
        seedProduct(nimbus.getId(), "Nimbus Audio Pro Buds TWS", "Electronics",
                "True wireless earbuds with charging case.", 2199, 3999, 18, "LIVE");
        seedProduct(nimbus.getId(), "Nimbus Bass+ Bluetooth Speaker", "Electronics",
                "Portable speaker with deep bass and 12-hour playback.", 1799, 2599, 0, "OUT_OF_STOCK");

        seedProduct(trail.getId(), "Trail & Co Urban Runner Shoes", "Fashion",
                "Lightweight running shoes with breathable mesh.", 2199, 3499, 76, "LIVE");
        seedProduct(trail.getId(), "Trail & Co Trek Hiking Boots", "Fashion",
                "Water-resistant boots built for the outdoors.", 3299, 4599, 40, "LIVE");

        seedProduct(verve.getId(), "Verve Home 3-in-1 Kitchen Blender", "Home & Kitchen",
                "Blend, grind, and juice with one compact appliance.", 1899, 2799, 55, "PENDING_APPROVAL");
        seedProduct(verve.getId(), "Verve Home Cotton Bedsheet Set", "Home & Kitchen",
                "100% cotton, 300 thread count, king size.", 1499, 2199, 90, "LIVE");

        couponRepository.save(new Coupon("WELCOME10", 10));
        couponRepository.save(new Coupon("AUDIO500", 8));

        // Additional category vendors — expands the marketplace beyond Electronics/Fashion/Home
        Vendor gizmo = createVendor("Gizmo Mobiles", "Mobiles", VendorStatus.APPROVED, "gizmo");
        seedProduct(gizmo.getId(), "Gizmo Nova 5G Smartphone", "Mobiles",
                "6.5\" AMOLED display, 5000mAh battery, triple camera setup.", 17999, 22999, 60, "LIVE");
        seedProduct(gizmo.getId(), "Gizmo Buds Wireless Earbuds", "Mobiles",
                "Compact true wireless earbuds with 24-hour total battery life.", 1299, 1999, 120, "LIVE");
        seedProduct(gizmo.getId(), "Gizmo FastCharge 65W Adapter", "Mobiles",
                "Universal fast charger compatible with most smartphones.", 899, 1299, 85, "LIVE");

        Vendor joy = createVendor("Little Joy Gifts", "Gifts", VendorStatus.APPROVED, "littlejoy");
        seedProduct(joy.getId(), "Personalized Photo Mug", "Gifts",
                "Ceramic mug printed with your favourite photo.", 399, 599, 200, "LIVE");
        seedProduct(joy.getId(), "Scented Candle Gift Set", "Gifts",
                "Set of 3 hand-poured scented candles in a gift box.", 699, 999, 140, "LIVE");

        Vendor pages = createVendor("PageTurner Books", "Books", VendorStatus.APPROVED, "pageturner");
        seedProduct(pages.getId(), "The Silent Orchard (Novel)", "Books",
                "A bestselling literary fiction paperback.", 349, 499, 95, "LIVE");
        seedProduct(pages.getId(), "Atomic Habits (Self-help)", "Books",
                "Practical strategies for building better habits.", 399, 599, 130, "LIVE");

        Vendor glow = createVendor("GlowUp Beauty", "Beauty", VendorStatus.APPROVED, "glowup");
        seedProduct(glow.getId(), "Vitamin C Face Serum", "Beauty",
                "Brightening serum with 10% vitamin C, 30ml.", 549, 799, 110, "LIVE");
        seedProduct(glow.getId(), "Matte Lipstick Set (4-pack)", "Beauty",
                "Long-lasting matte finish, 4 everyday shades.", 649, 999, 90, "LIVE");

        Vendor fit = createVendor("FitZone Sports", "Sports", VendorStatus.APPROVED, "fitzone");
        seedProduct(fit.getId(), "Yoga Mat with Carry Strap", "Sports",
                "6mm anti-slip yoga mat, includes carry strap.", 799, 1199, 75, "LIVE");
        seedProduct(fit.getId(), "Adjustable Dumbbell Set (10kg)", "Sports",
                "Pair of adjustable dumbbells, 2.5kg-10kg per hand.", 2499, 3499, 40, "LIVE");

        Vendor hometech = createVendor("HomeTech Appliances", "Appliances", VendorStatus.APPROVED, "hometech");
        seedProduct(hometech.getId(), "HomeTech 1L Electric Kettle", "Appliances",
                "Auto shut-off, stainless steel body.", 899, 1299, 100, "LIVE");
        seedProduct(hometech.getId(), "HomeTech Tower Fan", "Appliances",
                "Oscillating tower fan with remote control.", 2799, 3999, 55, "LIVE");

        Vendor basket = createVendor("Everyday Basket", "Grocery", VendorStatus.APPROVED, "basket");
        seedProduct(basket.getId(), "Organic Basmati Rice (5kg)", "Grocery",
                "Premium aged basmati rice, 5kg pack.", 649, 799, 200, "LIVE");
        seedProduct(basket.getId(), "Cold-Pressed Groundnut Oil (1L)", "Grocery",
                "Chemical-free, cold-pressed groundnut cooking oil.", 349, 449, 180, "LIVE");

        Address home = new Address();
        home.setUserId(customer.getId());
        home.setTag("HOME");
        home.setFullName("Priya Sharma");
        home.setPhone("+91 98220 00000");
        home.setLine("402, Willow Residency, Baner Road");
        home.setCity("Pune");
        home.setState("Maharashtra");
        home.setPincode("411045");
        addressRepository.save(home);

        Address office = new Address();
        office.setUserId(customer.getId());
        office.setTag("OFFICE");
        office.setFullName("Priya Sharma");
        office.setPhone("+91 98220 00000");
        office.setLine("Level 4, Cerebrum IT Park, Kalyani Nagar");
        office.setCity("Pune");
        office.setState("Maharashtra");
        office.setPincode("411006");
        addressRepository.save(office);

        System.out.println("=== ShopStack demo data seeded ===");
        System.out.println("Customer login: priya@example.com / password123");
        System.out.println("Vendor login:   nimbus@vendor.com / vendor123");
        System.out.println("Admin login:    admin@shopstack.com / admin123");
    }

    private void seedProduct(Long vendorId, String name, String category, String desc,
                              double price, double mrp, int stock, String status) {
        Product p = new Product(vendorId, name, category, desc, price, mrp, stock);
        p.setStatus(status);
        p.setRating(3.9 + Math.random() * 1.0);
        productRepository.save(p);
    }

    /** Creates a fresh vendor user + vendor profile in one call, to keep category seeding concise. */
    private Vendor createVendor(String businessName, String category, VendorStatus status, String emailPrefix) {
        User owner = userRepository.save(new User(businessName + " Owner", emailPrefix + "@vendor.com", "vendor123", Role.VENDOR));
        Vendor vendor = new Vendor(owner.getId(), businessName, category);
        vendor.setStatus(status);
        return vendorRepository.save(vendor);
    }
}