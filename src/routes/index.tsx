import { createFileRoute, Link } from "@tanstack/react-router";
import { HandHeart, Truck, Wallet } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { BRAND, BRAND_TAGLINE } from "@/lib/store";
import { SiteShell } from "@/components/site/site-shell";
import { ProductBrowser } from "@/components/site/product-browser";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Asym Decor — Handmade Trays, Candles & Vases in Pakistan" },
      {
        name: "description",
        content:
          "Warm, minimal handmade home decor from Pakistan: trinket trays, candles, wall decor and vases. Cash on Delivery, nationwide.",
      },
      { property: "og:title", content: "Asym Decor — Handmade decor for calm, warm homes" },
      {
        property: "og:description",
        content:
          "Trinket trays, candles, wall decor and vases. Order on WhatsApp or on-site. Cash on Delivery across Pakistan.",
      },
    ],
  }),
  component: HomePage,
});

const TRUST = [
  { icon: Wallet, title: "Cash on Delivery", copy: "Pay the courier when your parcel arrives." },
  { icon: Truck, title: "Nationwide Delivery", copy: "Shipped to every major city in Pakistan." },
  { icon: HandHeart, title: "Handmade with Care", copy: "Small batches, finished by hand." },
];

function HomePage() {
  return (
    <SiteShell>
      <section className="relative">
        <img
          src={heroImg}
          alt="Handmade vase, trinket tray and candle styled on a wooden console"
          width={1920}
          height={1088}
          className="h-[62vh] min-h-[380px] w-full object-cover sm:h-[72vh]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-6xl px-5">
            <div className="fade-up max-w-md">
              <p className="eyebrow">Handmade in Pakistan</p>
              <h1 className="mt-3 text-4xl leading-[1.05] sm:text-6xl">
                Quiet pieces for a warm home.
              </h1>
              <p className="mt-4 text-sm text-muted-foreground sm:text-base">{BRAND_TAGLINE}</p>
              <Button asChild size="lg" className="mt-7">
                <Link to="/shop">Shop Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">The collection</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Browse by category</h2>
          </div>
        </div>
        <div className="mt-8">
          <ProductBrowser />
        </div>
      </section>

      <section className="border-y border-border/60 bg-secondary/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:grid-cols-3">
          {TRUST.map((t) => (
            <div key={t.title} className="text-center sm:text-left">
              <t.icon className="mx-auto size-5 text-primary sm:mx-0" strokeWidth={1.5} />
              <h3 className="mt-3 text-lg">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 text-center sm:py-24">
        <p className="eyebrow">Our story</p>
        <h2 className="mt-3 text-3xl sm:text-4xl">Made slowly, in small batches</h2>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {BRAND} began at a kitchen table in Lahore, pouring one candle and one trinket tray at a
          time. Every piece is finished by hand, so no two are identical — and every order is packed
          the same day it's confirmed.
        </p>
        <Button asChild variant="outline" className="mt-7">
          <Link to="/about">More about us</Link>
        </Button>
      </section>
    </SiteShell>
  );
}
