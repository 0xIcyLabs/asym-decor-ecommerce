# Home Accents Co.

Build a modern, minimalist e-commerce website for a small home decor brand based in Pakistan, selling items like trinket trays, wall decor, candles, and vases. There is **no payment gateway** — all orders are Cash on Delivery, sent through one of two channels: WhatsApp or a direct on-site order. Customers can browse without logging in, but placing a direct website order requires a quick email-OTP login. There's also a password-protected admin panel to manage orders and the product catalog.

### Tech Stack
- Frontend: React + Tailwind CSS, fully responsive (mobile-first)
- Backend/Database: Supabase (Postgres database + built-in email-OTP Auth + Storage for product images) — or Firebase as an alternative. A real backend is required now (this is no longer a static-only site) because of order storage, product management, and login.
- No payment integration of any kind

### Design Direction
- Warm, elegant, minimal — boutique decor store feel, not a generic marketplace
- Soft neutral palette (cream/off-white background, charcoal text) with one warm accent color (terracotta, blush, or muted gold)
- Refined serif or elegant sans-serif headings, clean sans-serif body text
- Generous white space, soft shadows, rounded corners, large clean product photography, subtle hover/scale animations

### Public Site Structure

**1. Header/Navbar** — logo, nav links (Home, Shop, About, Contact), sticky on scroll, hamburger on mobile. Shows "Login" on the right, or an account menu ("My Orders" / "Log out") once a customer is logged in.

**2. Hero Section** — full-width banner, tagline, "Shop Now" button.

**3. Category Strip** — chips/icons (Trinket Trays, Candles, Wall Decor, Vases) that filter the product grid.

**4. Product Grid** — responsive card grid (4 cols desktop → 2 tablet → 1–2 mobile), image + name + short description + price in PKR. Search bar + category filter above the grid.

**5. Product Detail View** (modal or page) — larger image, full description, price, and an **"Order Now"** button that opens the order form.

**6. Order Form**
- Fields: Full Name, Phone Number, Complete Address, City (dropdown — used for delivery charge), Quantity, optional note
- Live order summary as the form is filled: item price × qty, delivery charge (by city), and **Total**
- Two buttons at the bottom (see behavior below):
  - **Order via WhatsApp**
  - **Place Order on Website**

**7. Order Button Behavior (important)**
Both buttons save the completed order form to the `orders` table first — so every order, regardless of channel, is visible in the admin panel, tagged with a `channel` field.
- **Order via WhatsApp**: after saving, opens a `wa.me` link in a new tab with the order details pre-filled in the message. No login required.
- **Place Order on Website**: requires the customer to be logged in (email OTP). If not logged in, show the login modal first, then submit — no redirect to another app. Order is saved with status `pending`; show an on-site confirmation. Customer can track status from "My Orders."

**8. Customer Login (Email OTP)**
- Customer enters their email → receives a 6-digit code by email → enters the code → logged in (Supabase Auth email-OTP flow)
- Only required at the "Place Order on Website" step — browsing and the WhatsApp flow stay fully open, no account needed
- Logged-in customers see "My Orders" in the header: a list of their website orders and current status

**9. About / Trust Section** — short brand story + trust badges ("Cash on Delivery," "Nationwide Delivery in Pakistan," "Handmade with Care").

**10. Footer** — contact info, WhatsApp/Instagram/Facebook icons, location, copyright.

### Admin Panel (`/admin`)
- **Admin login**: same email-OTP mechanism, but access to `/admin` is restricted to an admin allowlist (a `role = admin` field on the user record, or a fixed list of approved admin emails). Anyone else is redirected away.
- **Orders tab**: table of all orders from both channels — customer name, phone, address, city, product, qty, price, delivery charge, total, channel (WhatsApp/Website), and status. Admin can update status (Pending → Confirmed → Shipped → Delivered → Cancelled) and filter by channel/status.
- **Catalog tab**:
  - List of all products with quick edit/delete
  - "Add Product" form: name, category, price, description, image upload, in-stock toggle
  - "Edit Product" form, pre-filled with existing data
  - Delete asks for confirmation first
- **(Optional) Dashboard summary**: total orders, orders by channel, pending vs. completed count

### Suggested Database Structure
```
products: id, name, category, price, description, image_url, in_stock, created_at
orders:   id, customer_name, phone, address, city, product_id, quantity,
          item_price, delivery_charge, total, channel (whatsapp/instagram/website),
          status, user_id (nullable — set only for website orders), created_at
users:    id (from auth), email, role (customer/admin)
```

### Behavior & UX Notes
- Works smoothly on mobile first — most customers will arrive via Instagram/WhatsApp links
- Form validates required fields (name, phone, address) before any order button is enabled
- Currency always shown as "Rs." or "PKR"
- Since there's no payment gateway, make it clear on the order form/confirmation that all orders are Cash on Delivery

### Things to Fill In Before Publishing
- Replace `WHATSAPP_NUMBER` and `INSTAGRAM_USERNAME` placeholders with your real values
- Decide which email(s) get admin access
- Set real delivery charges per city
- Add real product photos and descriptions

### Nice-to-Haves (only if time allows)
- Small image gallery/zoom on product detail
- "Related products" row on product detail
- Fade-in animations as sections scroll into view
- Instagram feed / follow-us section near the footer

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8a8a6d5d-8fb5-4f90-af3d-bc391f48a696).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).


npm i
npm run dev
