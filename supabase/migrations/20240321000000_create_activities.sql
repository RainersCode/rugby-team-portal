-- Create activities table
create table activities (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    date timestamp with time zone,
    location text,
    max_participants integer,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    created_by uuid references auth.users(id) on delete set null
);

-- Create activity_participants table
create table activity_participants (
    activity_id uuid references activities(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    created_at timestamp with time zone default now(),
    primary key (activity_id, user_id)
);

-- Set up Row Level Security (RLS)
alter table activities enable row level security;
alter table activity_participants enable row level security;

-- Create policies for activities table
create policy "Activities are viewable by everyone"
    on activities for select
    using (true);

create policy "Activities can be inserted by admins"
    on activities for insert
    with check (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

create policy "Activities can be updated by admins"
    on activities for update
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

create policy "Activities can be deleted by admins"
    on activities for delete
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

-- Create policies for activity_participants table
create policy "Activity participants are viewable by everyone"
    on activity_participants for select
    using (true);

create policy "Users can register themselves for activities"
    on activity_participants for insert
    with check (auth.uid() = user_id);

create policy "Users can remove themselves from activities"
    on activity_participants for delete
    using (auth.uid() = user_id);

-- Create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for updating updated_at
create trigger update_activities_updated_at
    before update on activities
    for each row
    execute function update_updated_at_column(); 