-- Create a table for user profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  last_name text,
  phone text,
  updated_at timestamp with time zone,
  constraint proper_updated_at check(updated_at <= now())
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

-- Create policies
create policy "Users can view their own profile" 
  on profiles for select 
  using ( auth.uid() = id );

create policy "Users can update their own profile" 
  on profiles for update 
  using ( auth.uid() = id );

create policy "Users can insert their own profile" 
  on profiles for insert 
  with check ( auth.uid() = id );

-- Create a function to handle new user signup
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, updated_at)
  values (new.id, now());
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger to call the function on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 