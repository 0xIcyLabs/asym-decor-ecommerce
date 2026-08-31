# Handmade Home Decor Store (Cash on Delivery)

A modern, minimalist e-commerce website for a small home decor brand — trinket
trays, wall decor, candles and vases. There is **no payment gateway**: every
order is **Cash on Delivery**, placed either through **WhatsApp** or as a
**direct website order** after a quick email verification.

## Features

- Public catalog with category filters and search — no login required to browse
- Product detail dialog with related products
- **WhatsApp orders** — the form builds a ready-to-send order message
- **Website orders** — requires an email verification (magic-link) login
- Per-city delivery charges (Pakistan) with a live order total
- Customer order tracking page (`/my-orders`)
- Admin dashboard (`/admin`) to manage orders (status updates) and the product
  catalog (create / edit / delete, image upload)
- Admin access is granted by an email allowlist stored in the database
- Row Level Security on every table: visitors can read products only

## Tech stack

| Layer | Tool |
| --- | --- |
| Framework | TanStack Start (React 19, file-based routing, SSR) |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 + shadcn/ui components |
| Data / auth / storage | Supabase (hosted Postgres) |
| Data fetching | TanStack Query |

## Quick start

Prerequisites: **Node.js 18+** (20+ recommended) and npm.

```bash
npm install
cp .env.example .env      # then fill in your Supabase values
npm run dev
```

The app runs at **http://localhost:8080**.

> Without valid Supabase values the pages render but product/order data will
> fail to load. Follow "Backend setup" below.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server on port 8080 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint the project |

## Backend setup (Supabase)

The database is a **hosted (online) Supabase project** — it is not included in
this repository. Only the SQL migrations are. Create your own:

1. Sign up at [supabase.com](https://supabase.com) and create a free project.
2. Go to **Project Settings → API** and copy the **Project URL** and the
   **publishable / anon key** into your `.env` (see `.env.example`).
3. Apply the schema. Either:
   - **SQL editor:** open each file in `supabase/migrations/` in date order and
     run its contents, or
   - **CLI:** `npx supabase link --project-ref YOUR-PROJECT-REF && npx supabase db push`
4. **Storage:** confirm a bucket named `product-images` exists
   (Storage → New bucket → `product-images`). The migrations create it and its
   policies; create it manually if you ran only part of the SQL.
5. **Auth:** under **Authentication → Providers**, keep **Email** enabled.
   Login uses a verification link sent by email, so no password setup is
   needed. Add your site URL under **Authentication → URL Configuration**
   (e.g. `http://localhost:8080` for local development).

### What the schema contains

| Table | Purpose |
| --- | --- |
| `products` | Catalog. Public read, admin-only write |
| `orders` | WhatsApp + website orders, with status (`pending` → `delivered`) |
| `profiles` | One row per signed-up user |
| `user_roles` | `customer` / `admin` role per user |
| `admin_emails` | Allowlist: signing up with a listed email grants `admin` |

Role checks use a `SECURITY DEFINER` helper in a `private` schema, so roles can
never be escalated from the browser.

## Becoming an admin

`admin_emails` ships with the placeholder `admin@example.com`. Add your own
email, then sign up with it (the signup trigger reads the allowlist):

```sql
insert into public.admin_emails (email)
values ('you@example.com')
on conflict do nothing;
```

Already signed up before adding yourself? Promote the existing account:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'you@example.com'
on conflict do nothing;
```

Then open `/admin` while logged in.

## Customising the site

### Brand, contact details and socials

All of it lives in **`src/lib/store.ts`**, and each value can be overridden
with an environment variable — no code editing required:

| Setting | Env variable |
| --- | --- |
| Brand name | `VITE_BRAND_NAME` |
| Tagline | `VITE_BRAND_TAGLINE` |
| City / location | `VITE_BRAND_LOCATION` |
| Contact email | `VITE_CONTACT_EMAIL` |
| WhatsApp number (digits only, with country code) | `VITE_WHATSAPP_NUMBER` |
| Instagram handle (without `@`) | `VITE_INSTAGRAM_USERNAME` |
| TikTok handle (without `@`) | `VITE_TIKTOK_USERNAME` |

Page titles and social preview text are built from the brand name, so renaming
is a one-line change.

### Categories and delivery charges

Also in `src/lib/store.ts`:

```ts
export const CATEGORIES = ["Trinket Trays", "Candles", "Wall Decor", "Vases"];

export const CITY_DELIVERY: Record<string, number> = {
  Karachi: 250,
  Lahore: 200,
  // ...add or edit cities and PKR charges
  Other: 400,
};
```

`Other` is the fallback for any city not listed.

### Colours and fonts

The design system is defined as CSS variables in **`src/styles.css`**
(`@theme` block): terracotta accent, warm neutrals, Cormorant Garamond
headings with Karla body text. Change the tokens there and the whole site
follows — never hardcode colours in components.

### Products and images

Add products from the **`/admin` → Catalog** tab (name, price, category,
description, image upload). The starter images in `src/assets/` are used as
fallbacks when a product has no uploaded image (`src/lib/catalog.ts`).

## Project structure

```text
src/
  routes/                  file-based routes (URL = file path)
    __root.tsx             app shell, providers, global head tags
    index.tsx              home page
    shop.tsx               full catalog
    about.tsx  contact.tsx auth.tsx
    _authenticated/        login-required pages
      route.tsx            auth gate
      my-orders.tsx        customer order tracking
      admin.tsx            admin dashboard
  components/site/         header, footer, product browser/dialog, order form
  components/ui/           shadcn/ui primitives
  hooks/use-session.ts     current session + admin check
  lib/store.ts             brand config, delivery charges, WhatsApp helpers
  lib/catalog.ts           product queries and image fallbacks
  integrations/supabase/   generated client + types (do not edit by hand)
supabase/migrations/       database schema, policies and seed data
```

`src/routeTree.gen.ts` is generated — never edit it.

## Deployment

Any host that supports a Node/edge server build works (the project targets a
Cloudflare-style worker by default). Build with `npm run build` and set the
same environment variables from `.env.example` in your host's dashboard.

## Security notes

- **Never commit `.env`** — it is git-ignored. Only the publishable/anon key
  belongs in a frontend app.
- **Never publish the service-role key or database password.** They bypass all
  security rules.
- Keep **Row Level Security enabled** on every table; policies are included in
  the migrations.
- Admin rights come from the database allowlist, never from client-side state.

## License

No license file is included. Add one (e.g. MIT) if you want others to reuse
this code, and keep in mind that product photos and brand assets are usually
not yours to redistribute.
