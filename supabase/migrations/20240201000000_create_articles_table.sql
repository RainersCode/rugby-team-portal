-- Create articles table
create table public.articles (
  id uuid not null default uuid_generate_v4(),
  title text not null,
  slug text not null,
  content text not null,
  image text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  author_id uuid not null references auth.users(id) on delete cascade,
  constraint articles_pkey primary key (id),
  constraint articles_slug_key unique (slug)
);

-- Enable RLS
alter table public.articles enable row level security;

-- Create policies
create policy "Public articles are viewable by everyone"
  on public.articles for select
  using (true);

create policy "Users can insert their own articles"
  on public.articles for insert
  with check (auth.uid() = author_id);

create policy "Users can update their own articles"
  on public.articles for update
  using (auth.uid() = author_id);

create policy "Users can delete their own articles"
  on public.articles for delete
  using (auth.uid() = author_id);

-- Create function to automatically set updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger set_updated_at
  before update on public.articles
  for each row
  execute procedure public.handle_updated_at(); 