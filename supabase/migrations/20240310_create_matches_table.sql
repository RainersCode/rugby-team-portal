-- Create matches table
create table public.matches (
  id uuid not null default uuid_generate_v4(),
  home_team text not null,
  away_team text not null,
  home_team_image text not null,
  away_team_image text not null,
  match_date timestamp with time zone not null,
  venue text not null,
  competition text not null,
  home_score integer,
  away_score integer,
  status text not null check (status in ('upcoming', 'live', 'completed')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint matches_pkey primary key (id)
);

-- Enable RLS
alter table public.matches enable row level security;

-- Create policies
create policy "Matches are viewable by everyone"
  on public.matches for select
  using (true);

create policy "Only admins can insert matches"
  on public.matches for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Only admins can update matches"
  on public.matches for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Only admins can delete matches"
  on public.matches for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Create function to automatically set updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger set_matches_updated_at
  before update on public.matches
  for each row
  execute procedure public.handle_updated_at(); 