# Orbit — SaaS Admin & SSLCommerz Backend Platform (Next.js + Prisma + SSLCommerz)

A full-stack SaaS backend & admin dashboard built with **Next.js 14 (App Router)**, **TypeScript**, **Prisma ORM**, **PostgreSQL**, **JWT HTTP-Only Cookie Authentication**, and **SSLCommerz Payment Gateway** integration.

## Features

1. **Authentication & Security (`src/middleware.ts`, `src/lib/auth.ts`, `src/app/api/auth/*`)**
   - Register, Login, Logout, and Session inspection (`/api/auth/me`)
   - Password hashing with `bcryptjs`
   - Edge-compatible JWT verification via `jose` with HTTP-Only secure cookies
   - Protected routes: unauthenticated visitors are automatically redirected to `/login` before accessing `/dashboard`

2. **Database Schema (`prisma/schema.prisma`)**
   - `User` (Admin / SaaS workspace owners)
   - `Product` (SaaS plans, digital products, stock/status, pricing, currency)
   - `Customer` (Customer directory, email, phone, address, total spent, order count)
   - `Order` & `OrderItem` (Order lifecycle, payment status, SSLCommerz `tranId`, `valId`, bank transaction details)
   - `PaymentLog` (Full audit trail of SSLCommerz session initiation, IPN webhooks, success/fail/cancel callbacks, and validation API responses)

3. **RESTful Backend APIs (`src/app/api/*`)**
   - `POST /api/auth/register` — Create workspace admin account
   - `POST /api/auth/login` — Authenticate and set session cookie
   - `POST /api/auth/logout` — Clear session cookie
   - `GET /api/auth/me` — Get authenticated admin profile
   - `GET / POST /api/products` — List & create SaaS products
   - `GET / PATCH / DELETE /api/products/[id]` — Manage individual products
   - `GET / POST /api/customers` — List & create customers
   - `GET / PATCH / DELETE /api/customers/[id]` — Manage customer records
   - `GET / POST /api/orders` — List & create orders
   - `GET / PATCH /api/orders/[id]` — Inspect or update order status
   - `GET /api/dashboard/stats` — Aggregated KPI metrics, monthly revenue chart, and goal progress

4. **SSLCommerz Payment Gateway Integration (`src/lib/sslcommerz.ts`, `src/app/api/payment/*`)**
   - `POST /api/payment/init` — Creates a pending Order + Customer record and initiates an SSLCommerz checkout session, returning the `GatewayPageURL`
   - `POST / GET /api/payment/success` — Validates transaction using SSLCommerz Order Validation API (`validator/api/validationserverAPI.php`), updates Order to `PAID`, updates Customer spend stats, and redirects back to `/dashboard/orders?payment=success`
   - `POST / GET /api/payment/fail` — Marks order as `FAILED`, logs gateway payload, redirects to `/dashboard/orders?payment=failed`
   - `POST / GET /api/payment/cancel` — Marks order as `CANCELLED`, logs payload, redirects to `/dashboard/orders?payment=cancelled`
   - `POST /api/payment/ipn` — Server-to-server Instant Payment Notification (IPN) listener with amount & currency verification

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Update `DATABASE_URL`, `JWT_SECRET`, `SSLCZ_STORE_ID`, and `SSLCZ_STORE_PASSWORD` in `.env`.

3. **Initialize database & seed demo data:**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run prisma:seed
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.
   - Default seeded admin login: `emamur@orbit.io` / `Admin@1234`
