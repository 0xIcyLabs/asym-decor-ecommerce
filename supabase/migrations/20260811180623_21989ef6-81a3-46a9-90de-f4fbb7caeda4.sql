CREATE TYPE public.app_role AS ENUM ('customer','admin');
CREATE TYPE public.order_channel AS ENUM ('whatsapp','instagram','website');
CREATE TYPE public.order_status AS ENUM ('pending','confirmed','shipped','delivered','cancelled');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.admin_emails (
  email text PRIMARY KEY
);
GRANT ALL ON public.admin_emails TO service_role;
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;
INSERT INTO public.admin_emails (email) VALUES ('admin@example.com');

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN EXISTS (SELECT 1 FROM public.admin_emails a WHERE lower(a.email) = lower(NEW.email)) THEN 'admin'::public.app_role ELSE 'customer'::public.app_role END)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  image_url text,
  in_stock boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_admin_write" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL DEFAULT '',
  quantity integer NOT NULL DEFAULT 1,
  item_price numeric(10,2) NOT NULL DEFAULT 0,
  delivery_charge numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  note text,
  channel public.order_channel NOT NULL DEFAULT 'website',
  status public.order_status NOT NULL DEFAULT 'pending',
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_anon_insert" ON public.orders FOR INSERT TO anon WITH CHECK (user_id IS NULL AND channel <> 'website');
CREATE POLICY "orders_auth_insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "orders_select_own_or_admin" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders_admin_update" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders_admin_delete" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

INSERT INTO public.products (name, category, price, description, in_stock) VALUES
('Alia Trinket Tray','Trinket Trays',1850,'Hand-poured resin tray with a soft marbled finish — perfect for rings, keys and small treasures.',true),
('Sona Brass Trinket Dish','Trinket Trays',2400,'Antique-finish brass dish with a hand-hammered rim, made by artisans in Lahore.',true),
('Amber Musk Candle','Candles',1650,'Soy wax candle in a reusable ceramic vessel. Warm amber, cedar and a hint of musk. 40 hour burn.',true),
('Rose Oudh Candle','Candles',1750,'Slow-burning soy candle blending Pakistani rose with smoky oudh.',true),
('Arch Mirror Wall Set','Wall Decor',5900,'Set of three arched mirrors with warm wooden frames — a quiet statement for any wall.',true),
('Hand-carved Wooden Panel','Wall Decor',4300,'Traditional Chiniot carving in seasoned sheesham wood, finished with natural oil.',true),
('Ivory Ribbed Vase','Vases',2950,'Matte stoneware vase with fine vertical ribbing. Beautiful full or bare.',true),
('Terracotta Bud Vase Trio','Vases',2200,'Three small unglazed terracotta vases for single stems and dried blooms.',true);