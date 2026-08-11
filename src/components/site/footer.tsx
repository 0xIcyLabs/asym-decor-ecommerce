import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, MessageCircle, MapPin, Mail } from "lucide-react";
import {
  BRAND,
  BRAND_TAGLINE,
  CONTACT_EMAIL,
  FACEBOOK_USERNAME,
  INSTAGRAM_USERNAME,
  LOCATION,
  whatsappLink,
} from "@/lib/store";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="font-display text-2xl">{BRAND}</h3>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{BRAND_TAGLINE}</p>
          <div className="mt-5 flex gap-3">
            <a
              href={whatsappLink(`Hi ${BRAND}!`)}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="grid size-9 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-accent"
            >
              <MessageCircle className="size-4" strokeWidth={1.5} />
            </a>
            <a
              href={`https://instagram.com/${INSTAGRAM_USERNAME}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="grid size-9 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-accent"
            >
              <Instagram className="size-4" strokeWidth={1.5} />
            </a>
            <a
              href={`https://facebook.com/${FACEBOOK_USERNAME}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="grid size-9 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-accent"
            >
              <Facebook className="size-4" strokeWidth={1.5} />
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/shop" className="hover:text-foreground">
                Shop all
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-foreground">
                Our story
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/my-orders" className="hover:text-foreground">
                My orders
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Get in touch</p>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <MapPin className="size-4" strokeWidth={1.5} /> {LOCATION}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4" strokeWidth={1.5} /> {CONTACT_EMAIL}
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="size-4" strokeWidth={1.5} /> Cash on Delivery, nationwide
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 px-5 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {BRAND}. All rights reserved.
      </div>
    </footer>
  );
}
