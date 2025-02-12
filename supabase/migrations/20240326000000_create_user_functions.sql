-- Create a function to get user emails by their IDs
create or replace function get_user_emails(user_ids uuid[])
returns table (
  id uuid,
  email text
)
security definer
set search_path = public
language plpgsql
as $$
begin
  -- Check if the requesting user is an admin
  if not exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  ) then
    raise exception 'Not authorized';
  end if;

  -- Return user emails for the given IDs
  return query
  select u.id, u.email::text
  from auth.users u
  where u.id = any(user_ids);
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function get_user_emails to authenticated; 