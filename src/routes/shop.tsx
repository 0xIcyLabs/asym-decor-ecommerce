import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/site-shell";
import { ProductBrowser } from "@/components/site/product-browser";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop Handmade Decor — Trays, Candles, Vases | Asym Decor" },
      {
        name: "description",
        content:
          "Shop handmade trinket trays, soy candles, wall decor and vases. Prices in PKR, Cash on Delivery nationwide in Pakistan.",
      },
      { property: "og:title", content: "Shop handmade home decor — Asym Decor" },
      {
        property: "og:description",
        content: "Filter by category, search, and order on WhatsApp or directly on the site.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <p className="eyebrow">Shop</p>
        <h1 className="mt-2 text-4xl sm:text-5xl">Every piece we make</h1>
        <p className="mt-3 max-w-lg text-sm text-muted-foreground">
          All prices in PKR. Orders are Cash on Delivery — pay the courier at your door.
        </p>
        <div className="mt-10">
          <ProductBrowser />
        </div>
      </section>
    </SiteShell>
  );
}
