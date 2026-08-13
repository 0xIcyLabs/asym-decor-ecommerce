import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Music2, Mail, MapPin, MessageCircle } from "lucide-react";
import {
  BRAND,
  CONTACT_EMAIL,
  INSTAGRAM_USERNAME,
  LOCATION,
  TIKTOK_USERNAME,
  whatsappLink,
} from "@/lib/store";
import { SiteShell } from "@/components/site/site-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Orders on WhatsApp | Asym Decor" },
      {
        name: "description",
        content:
          "Message Asym Decor on WhatsApp or Instagram for orders, custom pieces and delivery questions. Based in Pakistan, Cash on Delivery nationwide.",
      },
      { property: "og:title", content: "Contact Asym Decor" },
      {
        property: "og:description",
        content: "Reach us on WhatsApp, Instagram or email for orders and custom requests.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-2xl px-5 py-14 text-center sm:py-24">
        <p className="eyebrow">Contact</p>
        <h1 className="mt-2 text-4xl sm:text-5xl">Say hello</h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          Questions about a piece, a custom order or delivery? WhatsApp is the fastest way to reach{" "}
          {BRAND} — we usually reply within a few hours.
        </p>

        <Button asChild size="lg" className="mt-8">
          <a href={whatsappLink(`Hi ${BRAND}! I have a question.`)} target="_blank" rel="noreferrer">
            <MessageCircle className="size-4" strokeWidth={1.5} />
            Chat on WhatsApp
          </a>
        </Button>

        <div className="mt-12 grid gap-4 text-left sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <Mail className="size-4 text-primary" strokeWidth={1.5} />
            <p className="mt-2 text-sm">Email</p>
            <p className="text-sm text-muted-foreground">{CONTACT_EMAIL}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <MapPin className="size-4 text-primary" strokeWidth={1.5} />
            <p className="mt-2 text-sm">Studio</p>
            <p className="text-sm text-muted-foreground">{LOCATION}</p>
          </div>
          <a
            href={`https://instagram.com/${INSTAGRAM_USERNAME}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-accent"
          >
            <Instagram className="size-4 text-primary" strokeWidth={1.5} />
            <p className="mt-2 text-sm">Instagram</p>
            <p className="text-sm text-muted-foreground">@{INSTAGRAM_USERNAME}</p>
          </a>
          <a
            href={`https://tiktok.com/@${TIKTOK_USERNAME}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-accent"
          >
            <Music2 className="size-4 text-primary" strokeWidth={1.5} />
            <p className="mt-2 text-sm">TikTok</p>
            <p className="text-sm text-muted-foreground">@{TIKTOK_USERNAME}</p>
          </a>
        </div>
      </section>
    </SiteShell>
  );
}
