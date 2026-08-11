CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM public;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT TO authenticated
USING ((id = auth.uid()) OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS roles_select_own ON public.user_roles;
CREATE POLICY roles_select_own ON public.user_roles FOR SELECT TO authenticated
USING ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS products_admin_write ON public.products;
CREATE POLICY products_admin_write ON public.products FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS orders_select_own_or_admin ON public.orders;
CREATE POLICY orders_select_own_or_admin ON public.orders FOR SELECT TO authenticated
USING ((user_id = auth.uid()) OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS orders_admin_update ON public.orders;
CREATE POLICY orders_admin_update ON public.orders FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS orders_admin_delete ON public.orders;
CREATE POLICY orders_admin_delete ON public.orders FOR DELETE TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS product_images_admin_read ON storage.objects;
CREATE POLICY product_images_admin_read ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS product_images_admin_insert ON storage.objects;
CREATE POLICY product_images_admin_insert ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS product_images_admin_update ON storage.objects;
CREATE POLICY product_images_admin_update ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS product_images_admin_delete ON storage.objects;
CREATE POLICY product_images_admin_delete ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images' AND private.has_role(auth.uid(), 'admin'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);