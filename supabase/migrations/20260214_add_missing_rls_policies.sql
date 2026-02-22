-- Migration: Add missing RLS policies for split_expenses, settlements, groups, group_members
-- Safe version: skips policies that already exist
-- Created: 2026-02-14

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='split_expenses' AND policyname='Members can insert expenses') THEN
    CREATE POLICY "Members can insert expenses" ON public.split_expenses FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = public.split_expenses.group_id AND user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='split_expenses' AND policyname='Members can update expenses') THEN
    CREATE POLICY "Members can update expenses" ON public.split_expenses FOR UPDATE USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = public.split_expenses.group_id AND user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='split_expenses' AND policyname='Members can delete expenses') THEN
    CREATE POLICY "Members can delete expenses" ON public.split_expenses FOR DELETE USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = public.split_expenses.group_id AND user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='settlements' AND policyname='Members can insert settlements') THEN
    CREATE POLICY "Members can insert settlements" ON public.settlements FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = public.settlements.group_id AND user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='groups' AND policyname='Users can create groups') THEN
    CREATE POLICY "Users can create groups" ON public.groups FOR INSERT WITH CHECK (auth.uid() = created_by);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='groups' AND policyname='Owners can delete groups') THEN
    CREATE POLICY "Owners can delete groups" ON public.groups FOR DELETE USING (auth.uid() = created_by);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='group_members' AND policyname='Members can add members to their groups') THEN
    CREATE POLICY "Members can add members to their groups" ON public.group_members FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = public.group_members.group_id AND gm.user_id = auth.uid()) OR auth.uid() = user_id);
  END IF;
END $$;
