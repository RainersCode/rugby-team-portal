create table if not exists public.players (
  id bigint primary key generated always as identity,
  name text not null,
  position text not null,
  number integer not null unique,
  image text not null,
  stats jsonb not null default '{"matches": 0, "tries": 0, "tackles": 0}'::jsonb,
  social jsonb not null default '{"instagram": "", "twitter": ""}'::jsonb,
  achievements text[] not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table public.players enable row level security;

create policy "Players are viewable by everyone"
  on public.players for select
  using (true);

create policy "Players are editable by admins only"
  on public.players for all
  using (
    auth.uid() in (
      select id from public.profiles
      where role = 'admin'
    )
  );

-- Create function to automatically update updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create trigger to automatically update updated_at
create trigger handle_players_updated_at
  before update on public.players
  for each row
  execute function public.handle_updated_at(); 