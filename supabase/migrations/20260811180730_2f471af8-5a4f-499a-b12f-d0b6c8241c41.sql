REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

CREATE POLICY "product_images_admin_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "product_images_admin_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "product_images_admin_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "product_images_admin_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(),'admin'));