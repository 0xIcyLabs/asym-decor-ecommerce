import { createFileRoute, Link } from "@tanstack/react-router";
import { HandHeart, Truck, Wallet } from "lucide-react";
import { BRAND, LOCATION } from "@/lib/store";
import { SiteShell } from "@/components/site/site-shell";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Handmade Asym Decor from Pakistan | Asym Decor" },
      {
        name: "description",
        content:
          "How Asym Decor began: small-batch handmade trays, candles and vases made in Pakistan, delivered nationwide with Cash on Delivery.",
      },
      { property: "og:title", content: "Our story — Asym Decor" },
      {
        property: "og:description",
        content: "Small-batch, handmade decor made in Pakistan and shipped nationwide.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteShell>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 sm:py-20 lg:grid-cols-2">
        <div>
          <p className="eyebrow">About</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">A small studio, slow work</h1>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <p>
              {BRAND} is a small home decor studio based in {LOCATION}. We started with a single
              batch of resin trinket trays and a handful of soy candles poured after work hours.
            </p>
            <p>
              Today we work with artisans in Lahore and Chiniot on brass, wood and stoneware —
              always in small batches, always finished by hand. That means gentle variation from
              piece to piece, and pieces that feel like they belong in a home rather than a
              warehouse.
            </p>
            <p>
              There's no card payment here on purpose. You order, we confirm on WhatsApp, and you
              pay the courier in cash when the parcel reaches your door.
            </p>
          </div>
          <Button asChild className="mt-7">
            <Link to="/shop">Browse the collection</Link>
          </Button>
        </div>
        <img
          src={heroImg}
          alt="Styled shelf with handmade vase, tray and candle"
          loading="lazy"
          width={1920}
          height={1088}
          className="aspect-4/3 w-full rounded-2xl object-cover shadow-[var(--shadow-lift)]"
        />
      </section>

      <section className="border-t border-border/60 bg-secondary/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:grid-cols-3">
          {[
            { icon: Wallet, title: "Cash on Delivery", copy: "No online payment, ever." },
            { icon: Truck, title: "Nationwide Delivery", copy: "Every major city in Pakistan." },
            { icon: HandHeart, title: "Handmade with Care", copy: "Small batches, hand-finished." },
          ].map((t) => (
            <div key={t.title} className="text-center sm:text-left">
              <t.icon className="mx-auto size-5 text-primary sm:mx-0" strokeWidth={1.5} />
              <h2 className="mt-3 text-lg">{t.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.copy}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
