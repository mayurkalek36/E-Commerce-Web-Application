# ShopStack — Multi-Vendor E-Commerce Platform

A full-stack implementation of the ShopStack architecture: **React.js** frontend +
**Spring Boot** backend (REST API + JPA + H2 in-memory database).

## What's implemented

| Architecture module        | Where it lives |
|-----------------------------|----------------|
| Auth Service (register/login, roles) | `AuthController` + `Login.jsx` |
| User / Customer module      | `CustomerDashboard.jsx` (orders, wishlist, addresses, profile) |
| Vendor Service               | `VendorController` + `VendorDashboard.jsx` (products, inventory, orders, analytics, payouts) |
| Product Catalog Service      | `ProductController` + `Shop.jsx` / `ProductDetail.jsx` |
| Inventory Management         | Stock tracked on `Product.stock`; low-stock views in Vendor & Warehouse dashboards |
| Cart & Checkout              | `CartController` + `Cart.jsx` / `Checkout.jsx` |
| Payment Service              | `Payment.jsx` (card/UPI/netbanking/wallet/COD selector) + `OrderController.placeOrder` |
| Order Management             | `OrderController` + order history/status across all dashboards |
| Warehouse Management         | `WarehouseDashboard.jsx` (stock overview, pick & pack, low-stock alerts) |
| Coupon Engine                 | `Coupon` entity + coupon application in `OrderController` |
| Admin / Marketplace Analytics | `AdminController` + `AdminDashboard.jsx` (GMV, vendor approvals, commission, orders) |
| Reports & Export              | Placeholder buttons in Admin dashboard (wire to Apache POI / iText on the backend) |

Notification, real-time shipment tracking, and the message broker/cache layer from the
architecture diagram are infrastructure concerns (Kafka, Redis, Firebase, Twilio) that
aren't meaningfully demo-able without real third-party accounts — the data model and UI
are shaped to plug those in later without restructuring.

## Project structure

```
shopstack-fullstack/
├── backend/     Spring Boot 3 REST API (Java 17, Maven, H2 in-memory DB)
└── frontend/    React 18 + Vite + React Router + Axios
```

## Running the backend

Requires Java 17+ and Maven.

```bash
cd backend
mvn spring-boot:run
```

The API starts on **http://localhost:8080**. On first run it seeds demo data automatically:

| Role      | Email                  | Password     |
|-----------|-------------------------|--------------|
| Customer  | priya@example.com       | password123  |
| Vendor    | nimbus@vendor.com       | vendor123    |
| Admin     | admin@shopstack.com     | admin123     |
| Warehouse | warehouse@shopstack.com | warehouse123 |

H2 console (inspect seeded tables): http://localhost:8080/h2-console
(JDBC URL: `jdbc:h2:mem:shopstack`, user `sa`, no password)

## Running the frontend

Requires Node.js 18+.

```bash
cd frontend
npm install
npm run dev
```

Opens on **http://localhost:5173**. It's already configured (via CORS on the backend) to
talk to the API at `http://localhost:8080/api` — make sure the backend is running first.

## Demo flow to try

1. Log in as **Customer** → browse the storefront → add items to cart → checkout → pay → see order confirmation → check "My account" for order history.
2. Log in as **Vendor** (Nimbus Audio) → add a new product → watch it appear as "Pending approval" → check inventory/orders/payouts.
3. Log in as **Admin** → approve the pending Verve Home vendor → adjust a commission rate → view marketplace GMV.
4. Log in as **Warehouse** → see orders awaiting pick & pack and live low-stock alerts.

## Moving to production

This is a functional demo, not a production-hardened app. Before shipping:
- Replace H2 with PostgreSQL (swap the datasource in `application.properties`).
- Add Spring Security + JWT; passwords are currently stored in plain text for demo simplicity.
- Add real payment gateway integration (Stripe/Razorpay) instead of the simulated payment step.
- Add Kafka/RabbitMQ for async events, Redis for caching, and real notification providers (Twilio, Firebase, JavaMailSender) as shown in the architecture diagram.
