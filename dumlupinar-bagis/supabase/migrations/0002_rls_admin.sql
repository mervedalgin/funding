-- Admin RLS policies for donation_items
create policy "Authenticated users can insert donation items"
  on public.donation_items for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update donation items"
  on public.donation_items for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete donation items"
  on public.donation_items for delete
  to authenticated
  using (true);

-- Admin RLS policies for payment_channels
create policy "Authenticated users can insert payment channels"
  on public.payment_channels for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update payment channels"
  on public.payment_channels for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete payment channels"
  on public.payment_channels for delete
  to authenticated
  using (true);
