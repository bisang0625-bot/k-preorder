-- 1. Create Products Table
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  is_active boolean default true not null
);

-- 2. Create Store Settings Table (Singleton pattern)
create table if not exists store_settings (
  id integer primary key default 1,
  allowed_dates jsonb default '[]'::jsonb not null,
  valid_zipcodes jsonb default '[]'::jsonb not null,
  pickup_locations jsonb default '[]'::jsonb not null,
  top_description text,
  footer_info text
);

-- Insert default row for store_settings if not exists
insert into store_settings (id) values (1) on conflict (id) do nothing;

-- Ensure columns exist if table was already created
alter table store_settings add column if not exists top_description text;
alter table store_settings add column if not exists footer_info text;

-- 3. Set up Row Level Security (RLS)
-- Since we are building a custom admin dashboard that connects via the anon key (or we can use the service role, but for simplicity we'll use anon + our custom login wrapper, or just allow all for this PoC phase), we'll enable RLS but allow anon access for now. In a real production environment, you should use Supabase Auth to secure these.
-- For the sake of this easy admin dashboard, we will allow anyone to read products/settings, but only allow changes if we implement a custom password check in our Next.js API.
alter table products enable row level security;
alter table store_settings enable row level security;

-- Allow public read access (Menu Display)
create policy "Allow public read access to products" on products for select to anon using (true);
create policy "Allow public read access to settings" on store_settings for select to anon using (true);

-- Allow public write access (We secure this via Next.js Admin Password in our UI instead of Supabase Auth for simplicity)
create policy "Allow public insert to products" on products for insert to anon with check (true);
create policy "Allow public update to products" on products for update to anon using (true);
create policy "Allow public delete to products" on products for delete to anon using (true);

create policy "Allow public update to settings" on store_settings for update to anon using (true);

-- Also add a policy for the Orders table if you want the admin dashboard to read orders
alter table orders enable row level security;
create policy "Allow public read of orders" on orders for select to anon using (true);
create policy "Allow public update of orders" on orders for update to anon using (true);
create policy "Allow public delete of orders" on orders for delete to anon using (true);

-- 4. Create Storage Bucket for Product Images
-- This creates a public bucket called 'product-images' so anyone can see the photos on the website.
insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 5. Storage Access Policies
-- Allow anyone to view images (for the main website)
create policy "Public Access to Product Images" 
on storage.objects for select 
to public 
using (bucket_id = 'product-images');

-- Allow anyone to upload new images via the Admin Dashboard
create policy "Allow Uploads to Product Images" 
on storage.objects for insert 
to anon 
with check (bucket_id = 'product-images');

-- Allow anyone to delete images when they delete a product
create policy "Allow Deletes from Product Images" 
on storage.objects for delete 
using (bucket_id = 'product-images');

-- 6. Create Orders Table (if missing) and ensure special_request column exists
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  customer_email text not null,
  delivery_date timestamp with time zone not null,
  delivery_address jsonb,
  order_items jsonb not null,
  special_request text,
  total_amount numeric not null,
  status text not null default 'pending',
  payment_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table orders add column if not exists special_request text;
