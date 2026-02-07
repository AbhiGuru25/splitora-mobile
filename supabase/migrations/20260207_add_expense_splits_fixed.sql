-- Migration: Add expense_splits table (Fixed - handles existing policies)
-- Description: Creates the expense_splits table for storing individual split amounts
-- Created: 2026-02-07

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Members can view splits" ON public.expense_splits;
DROP POLICY IF EXISTS "Members can add splits" ON public.expense_splits;
DROP POLICY IF EXISTS "Members can update splits" ON public.expense_splits;
DROP POLICY IF EXISTS "Members can delete splits" ON public.expense_splits;

-- Create the expense_splits table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.expense_splits (
  id uuid default gen_random_uuid() primary key,
  expense_id uuid references public.split_expenses(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  share_amount numeric(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on the new table
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Members can view splits" 
ON public.expense_splits FOR SELECT 
USING ( 
  expense_id IN (
    SELECT id FROM public.split_expenses 
    WHERE group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Members can add splits" 
ON public.expense_splits FOR INSERT 
WITH CHECK ( 
  expense_id IN (
    SELECT id FROM public.split_expenses 
    WHERE group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Members can update splits" 
ON public.expense_splits FOR UPDATE 
USING ( 
  expense_id IN (
    SELECT id FROM public.split_expenses 
    WHERE group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Members can delete splits" 
ON public.expense_splits FOR DELETE 
USING ( 
  expense_id IN (
    SELECT id FROM public.split_expenses 
    WHERE group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  )
);

-- Add to realtime publication (ignore if already exists)
DO $$ 
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.expense_splits;
EXCEPTION WHEN duplicate_object THEN
  NULL; -- Table already in publication, ignore
END $$;
