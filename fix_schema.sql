-- 1. Create the missing 'expense_splits' table
create table if not exists expense_splits (
  id uuid default gen_random_uuid() primary key,
  expense_id uuid references split_expenses(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  share_amount numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS on the new table
alter table expense_splits enable row level security;

-- 3. Create RLS policies for expense_splits
-- (These are the same as in the previous script, but specific to this table)

-- View splits if you act on the parent expense (which requires group membership)
-- We check if the user is a member of the group that the expense belongs to.
create policy "Members can view splits" 
on expense_splits for select 
using ( 
  expense_id in (
    select id from split_expenses 
    where group_id in (select group_id from group_members where user_id = auth.uid())
  )
);

-- Insert splits if member of group
create policy "Members can add splits" 
on expense_splits for insert 
with check ( 
  expense_id in (
    select id from split_expenses 
    where group_id in (select group_id from group_members where user_id = auth.uid())
  )
);

-- 4. Re-run key policies that might have failed due to missing table dependency? 
-- (Actually, other policies don't depend on expense_splits, so we are good).
