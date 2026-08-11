import { useEffect, useState } from "react";
import { productImage, type Product } from "@/lib/catalog";
import { formatPKR } from "@/lib/store";
import { OrderForm } from "@/components/site/order-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  product: Product | null;
  related: Product[];
  onOpenChange: (open: boolean) => void;
  onSelectProduct: (product: Product) => void;
};

export function ProductDialog({ product, related, onOpenChange, onSelectProduct }: Props) {
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    setOrdering(false);
  }, [product?.id]);

  if (!product) return null;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-3xl">
        <div className="grid sm:grid-cols-2">
          <div className="bg-secondary/60">
            <img
              src={productImage(product)}
              alt={product.name}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
          </div>
          <div className="p-6">
            <DialogHeader className="space-y-2 text-left">
              <p className="eyebrow">{product.category}</p>
              <DialogTitle className="font-display text-3xl leading-tight">
                {product.name}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {product.description}
              </DialogDescription>
            </DialogHeader>
            <p className="mt-4 text-2xl">{formatPKR(Number(product.price))}</p>
            {product.in_stock ? (
              <Badge variant="secondary" className="mt-3">
                In stock · Cash on Delivery
              </Badge>
            ) : (
              <Badge variant="outline" className="mt-3">
                Currently sold out
              </Badge>
            )}
            {!ordering ? (
              <Button
                className="mt-6 w-full"
                disabled={!product.in_stock}
                onClick={() => setOrdering(true)}
              >
                Order Now
              </Button>
            ) : null}
          </div>
        </div>

        {ordering ? (
          <div className="border-t border-border p-6">
            <h3 className="mb-4 text-xl">Your details</h3>
            <OrderForm product={product} onDone={() => onOpenChange(false)} />
          </div>
        ) : related.length > 0 ? (
          <div className="border-t border-border p-6">
            <p className="eyebrow">You may also like</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {related.slice(0, 3).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onSelectProduct(r)}
                  className="group text-left"
                >
                  <img
                    src={productImage(r)}
                    alt={r.name}
                    loading="lazy"
                    className="aspect-square w-full rounded-lg object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <p className="mt-2 line-clamp-1 text-xs">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{formatPKR(Number(r.price))}</p>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
