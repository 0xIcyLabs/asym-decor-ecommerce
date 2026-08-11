import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import trayImg from "@/assets/p-tray.jpg";
import candleImg from "@/assets/p-candle.jpg";
import wallImg from "@/assets/p-wall.jpg";
import vaseImg from "@/assets/p-vase.jpg";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image_url: string | null;
  in_stock: boolean;
  created_at: string;
};

const FALLBACKS: Record<string, string> = {
  "Trinket Trays": trayImg,
  Candles: candleImg,
  "Wall Decor": wallImg,
  Vases: vaseImg,
};

export function productImage(product: Pick<Product, "image_url" | "category">): string {
  return product.image_url || FALLBACKS[product.category] || trayImg;
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });
}
