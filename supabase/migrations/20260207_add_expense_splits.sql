-- Migration: Add expense_splits table
-- Description: Creates the expense_splits table for storing individual split amounts per user for each split expense
-- Created: 2026-02-07

-- Create the expense_splits table
create table if not exists public.expense_splits (
  id uuid default gen_random_uuid() primary key,
  expense_id uuid references public.split_expenses(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  share_amount numeric(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on the new table
alter table public.expense_splits enable row level security;

-- Create RLS policies for expense_splits
-- View splits if you are a member of the group that the expense belongs to
create policy "Members can view splits" 
on public.expense_splits for select 
using ( 
  expense_id in (
    select id from public.split_expenses 
    where group_id in (
      select group_id from public.group_members where user_id = auth.uid()
    )
  )
);

-- Insert splits if member of group
create policy "Members can add splits" 
on public.expense_splits for insert 
with check ( 
  expense_id in (
    select id from public.split_expenses 
    where group_id in (
      select group_id from public.group_members where user_id = auth.uid()
    )
  )
);

-- Update splits if member of group
create policy "Members can update splits" 
on public.expense_splits for update 
using ( 
  expense_id in (
    select id from public.split_expenses 
    where group_id in (
      select group_id from public.group_members where user_id = auth.uid()
    )
  )
);

-- Delete splits if member of group
create policy "Members can delete splits" 
on public.expense_splits for delete 
using ( 
  expense_id in (
    select id from public.split_expenses 
    where group_id in (
      select group_id from public.group_members where user_id = auth.uid()
    )
  )
);

-- Add to realtime publication
alter publication supabase_realtime add table public.expense_splits;
