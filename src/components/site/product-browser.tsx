import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { productImage, useProducts, type Product } from "@/lib/catalog";
import { CATEGORIES, formatPKR } from "@/lib/store";
import { ProductDialog } from "@/components/site/product-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ProductBrowser({ initialCategory = "All" }: { initialCategory?: string }) {
  const { data: products, isLoading } = useProducts();
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const list = products ?? [];
    const q = query.trim().toLowerCase();
    return list.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
    );
  }, [products, category, query]);

  const chips = ["All", ...CATEGORIES];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-xs tracking-wide transition-colors",
                category === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pieces…"
            className="pl-9"
            aria-label="Search products"
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))
          : filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p)}
                className="group text-left"
              >
                <div className="overflow-hidden rounded-xl bg-secondary/60 shadow-[var(--shadow-soft)]">
                  <img
                    src={productImage(p)}
                    alt={p.name}
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="mt-3 text-base leading-snug">{p.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
                <p className="mt-2 text-sm">
                  {formatPKR(Number(p.price))}
                  {!p.in_stock ? (
                    <span className="ml-2 text-xs text-muted-foreground">Sold out</span>
                  ) : null}
                </p>
              </button>
            ))}
      </div>

      {!isLoading && filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Nothing here yet — try another category.
        </p>
      ) : null}

      <ProductDialog
        product={selected}
        related={(products ?? []).filter(
          (p) => p.id !== selected?.id && p.category === selected?.category,
        )}
        onOpenChange={(open) => !open && setSelected(null)}
        onSelectProduct={setSelected}
      />
    </div>
  );
}
