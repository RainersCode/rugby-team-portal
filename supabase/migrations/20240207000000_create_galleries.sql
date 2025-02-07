-- Create galleries table
create table public.galleries (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create gallery_photos table
create table public.gallery_photos (
    id uuid default gen_random_uuid() primary key,
    gallery_id uuid references public.galleries(id) on delete cascade,
    image_url text not null,
    title text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create updated_at trigger function if it doesn't exist
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;

-- Create updated_at trigger for galleries
create trigger handle_galleries_updated_at
    before update on public.galleries
    for each row
    execute function public.handle_updated_at();

-- Create updated_at trigger for gallery_photos
create trigger handle_gallery_photos_updated_at
    before update on public.gallery_photos
    for each row
    execute function public.handle_updated_at();

-- Enable RLS
alter table public.galleries enable row level security;
alter table public.gallery_photos enable row level security;

-- Galleries policies
create policy "Public Read Galleries"
on public.galleries for select
to public
using (true);

create policy "Admin Insert Galleries"
on public.galleries for insert
to authenticated
with check (
    auth.jwt() ->> 'role' = 'admin'
);

create policy "Admin Update Galleries"
on public.galleries for update
to authenticated
using (auth.jwt() ->> 'role' = 'admin')
with check (auth.jwt() ->> 'role' = 'admin');

create policy "Admin Delete Galleries"
on public.galleries for delete
to authenticated
using (auth.jwt() ->> 'role' = 'admin');

-- Gallery photos policies
create policy "Public Read Gallery Photos"
on public.gallery_photos for select
to public
using (true);

create policy "Admin Insert Gallery Photos"
on public.gallery_photos for insert
to authenticated
with check (
    auth.jwt() ->> 'role' = 'admin'
);

create policy "Admin Update Gallery Photos"
on public.gallery_photos for update
to authenticated
using (auth.jwt() ->> 'role' = 'admin')
with check (auth.jwt() ->> 'role' = 'admin');

create policy "Admin Delete Gallery Photos"
on public.gallery_photos for delete
to authenticated
using (auth.jwt() ->> 'role' = 'admin');

-- Create storage bucket for photos if it doesn't exist
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Public Read Photos"
on storage.objects for select
to public
using (bucket_id = 'photos');

create policy "Admin Insert Photos"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'photos'
    and (auth.jwt() ->> 'role')::text = 'admin'
);

create policy "Admin Update Photos"
on storage.objects for update
to authenticated
using (
    bucket_id = 'photos'
    and (auth.jwt() ->> 'role')::text = 'admin'
)
with check (
    bucket_id = 'photos'
    and (auth.jwt() ->> 'role')::text = 'admin'
);

create policy "Admin Delete Photos"
on storage.objects for delete
to authenticated
using (
    bucket_id = 'photos'
    and (auth.jwt() ->> 'role')::text = 'admin'
); 