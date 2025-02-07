-- Create live_streams table
create table public.live_streams (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    youtube_id text not null,
    stream_date timestamp with time zone not null,
    status text not null check (status in ('active', 'completed')),
    thumbnail_url text,
    viewers_count integer,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create updated_at trigger
create trigger handle_live_streams_updated_at
    before update on public.live_streams
    for each row
    execute function public.handle_updated_at();

-- Enable RLS
alter table public.live_streams enable row level security;

-- Create policies
create policy "Public Read Live Streams"
on public.live_streams for select
to public
using (true);

create policy "Admin Insert Live Streams"
on public.live_streams for insert
to authenticated
with check (
    auth.jwt() ->> 'role' = 'admin'
);

create policy "Admin Update Live Streams"
on public.live_streams for update
to authenticated
using (auth.jwt() ->> 'role' = 'admin')
with check (auth.jwt() ->> 'role' = 'admin');

create policy "Admin Delete Live Streams"
on public.live_streams for delete
to authenticated
using (auth.jwt() ->> 'role' = 'admin'); 