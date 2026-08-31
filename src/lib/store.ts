// ---------------------------------------------------------------------------
// BRAND CONFIGURATION
// ---------------------------------------------------------------------------
// Every value below can be set with an environment variable (see .env.example)
// so you never have to edit code to rebrand the site. If a variable is not
// set, the placeholder fallback is used and the app still runs.
// ---------------------------------------------------------------------------

const env = import.meta.env as Record<string, string | undefined>;

export const BRAND = env["VITE_BRAND_NAME"] || "Your Brand";
export const BRAND_TAGLINE =
  env["VITE_BRAND_TAGLINE"] || "Handmade pieces for calm, warm homes.";
/** Digits only, including country code. Example: 923001234567 */
export const WHATSAPP_NUMBER = env["VITE_WHATSAPP_NUMBER"] || "920000000000";
export const INSTAGRAM_USERNAME = env["VITE_INSTAGRAM_USERNAME"] || "yourhandle";
export const TIKTOK_USERNAME = env["VITE_TIKTOK_USERNAME"] || "yourhandle";
export const CONTACT_EMAIL = env["VITE_CONTACT_EMAIL"] || "your-email@example.com";
export const LOCATION = env["VITE_BRAND_LOCATION"] || "Your City, Pakistan";


export const CATEGORIES = ["Trinket Trays", "Candles", "Wall Decor", "Vases"] as const;

// TODO: set your real delivery charges per city (PKR).
export const CITY_DELIVERY: Record<string, number> = {
  Karachi: 250,
  Lahore: 200,
  Islamabad: 250,
  Rawalpindi: 250,
  Faisalabad: 300,
  Multan: 300,
  Peshawar: 350,
  Quetta: 450,
  Sialkot: 300,
  Hyderabad: 350,
  Gujranwala: 300,
  Other: 400,
};

export const CITIES = Object.keys(CITY_DELIVERY);

export function formatPKR(value: number): string {
  return `Rs. ${Math.round(value).toLocaleString("en-PK")}`;
}

export function deliveryChargeFor(city: string): number {
  return CITY_DELIVERY[city] ?? CITY_DELIVERY["Other"] ?? 0;
}

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderDraft = {
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  quantity: number;
  note: string;
};

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsappMessage(opts: {
  productName: string;
  draft: OrderDraft;
  itemPrice: number;
  delivery: number;
  total: number;
}): string {
  const { productName, draft, itemPrice, delivery, total } = opts;
  return [
    `Assalam o Alaikum ${BRAND}! I'd like to place an order (Cash on Delivery).`,
    "",
    `Product: ${productName}`,
    `Quantity: ${draft.quantity}`,
    `Item price: ${formatPKR(itemPrice)} x ${draft.quantity} = ${formatPKR(itemPrice * draft.quantity)}`,
    `Delivery (${draft.city}): ${formatPKR(delivery)}`,
    `Total: ${formatPKR(total)}`,
    "",
    `Name: ${draft.customer_name}`,
    `Phone: ${draft.phone}`,
    `Address: ${draft.address}, ${draft.city}`,
    draft.note ? `Note: ${draft.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
