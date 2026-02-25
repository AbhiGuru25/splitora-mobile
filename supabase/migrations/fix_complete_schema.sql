-- ============================================================
-- SPLITORA: Complete Database Fix Script
-- Run this entire script in the Supabase SQL Editor.
-- It is fully idempotent — safe to run multiple times.
-- ============================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Profiles are viewable by everyone') THEN
    CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can insert their own profile') THEN
    CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- 3. GROUPS TABLE
CREATE TABLE IF NOT EXISTS public.groups (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- 4. GROUP_MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.group_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- 5. PERSONAL_EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.personal_expenses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10, 2) NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.personal_expenses ENABLE ROW LEVEL SECURITY;

-- 6. SPLIT_EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.split_expenses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  paid_by uuid REFERENCES public.profiles(id) NOT NULL,
  description text NOT NULL,
  total_amount decimal(10, 2) NOT NULL,
  category text NOT NULL,
  date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.split_expenses ENABLE ROW LEVEL SECURITY;

-- 7. EXPENSE_SPLITS TABLE
CREATE TABLE IF NOT EXISTS public.expense_splits (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  expense_id uuid REFERENCES public.split_expenses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;

-- 8. SETTLEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.settlements (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  from_user uuid REFERENCES public.profiles(id) NOT NULL,
  to_user uuid REFERENCES public.profiles(id) NOT NULL,
  amount decimal(10, 2) NOT NULL,
  settled_at timestamptz DEFAULT now()
);
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- 9. GROUP_INVITE_CODES TABLE
CREATE TABLE IF NOT EXISTS public.group_invite_codes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  code text UNIQUE NOT NULL,
  created_by uuid REFERENCES public.profiles(id) NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.group_invite_codes ENABLE ROW LEVEL SECURITY;

-- 10. RLS POLICIES (all idempotent)
DO $$ BEGIN
  -- groups
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='groups' AND policyname='Users can view groups they match in group_members') THEN
    CREATE POLICY "Users can view groups they match in group_members" ON public.groups FOR SELECT
      USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = public.groups.id AND user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='groups' AND policyname='Users can create groups') THEN
    CREATE POLICY "Users can create groups" ON public.groups FOR INSERT WITH CHECK (auth.uid() = created_by);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='groups' AND policyname='Users can update their own groups') THEN
    CREATE POLICY "Users can update their own groups" ON public.groups FOR UPDATE USING (auth.uid() = created_by);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='groups' AND policyname='Users can delete their own groups') THEN
    CREATE POLICY "Users can delete their own groups" ON public.groups FOR DELETE USING (auth.uid() = created_by);
  END IF;

  -- group_members
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='group_members' AND policyname='Users can view members of their groups') THEN
    CREATE POLICY "Users can view members of their groups" ON public.group_members FOR SELECT
      USING (EXISTS (SELECT 1 FROM public.group_members gm WHERE gm.group_id = public.group_members.group_id AND gm.user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='group_members' AND policyname='Users can join groups') THEN
    CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='group_members' AND policyname='Users can leave groups') THEN
    CREATE POLICY "Users can leave groups" ON public.group_members FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- personal_expenses
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='personal_expenses' AND policyname='Users can view own expenses') THEN
    CREATE POLICY "Users can view own expenses" ON public.personal_expenses FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='personal_expenses' AND policyname='Users can insert own expenses') THEN
    CREATE POLICY "Users can insert own expenses" ON public.personal_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='personal_expenses' AND policyname='Users can update own expenses') THEN
    CREATE POLICY "Users can update own expenses" ON public.personal_expenses FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='personal_expenses' AND policyname='Users can delete own expenses') THEN
    CREATE POLICY "Users can delete own expenses" ON public.personal_expenses FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- split_expenses
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='split_expenses' AND policyname='Users can view expenses in their groups') THEN
    CREATE POLICY "Users can view expenses in their groups" ON public.split_expenses FOR SELECT
      USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = public.split_expenses.group_id AND user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='split_expenses' AND policyname='Group members can insert expenses') THEN
    CREATE POLICY "Group members can insert expenses" ON public.split_expenses FOR INSERT
      WITH CHECK (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = public.split_expenses.group_id AND user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='split_expenses' AND policyname='Payer can update their expenses') THEN
    CREATE POLICY "Payer can update their expenses" ON public.split_expenses FOR UPDATE USING (auth.uid() = paid_by);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='split_expenses' AND policyname='Payer can delete their expenses') THEN
    CREATE POLICY "Payer can delete their expenses" ON public.split_expenses FOR DELETE USING (auth.uid() = paid_by);
  END IF;

  -- expense_splits
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='expense_splits' AND policyname='Group members can view expense splits') THEN
    CREATE POLICY "Group members can view expense splits" ON public.expense_splits FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.split_expenses se
        JOIN public.group_members gm ON gm.group_id = se.group_id
        WHERE se.id = expense_splits.expense_id AND gm.user_id = auth.uid()
      ));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='expense_splits' AND policyname='Group members can insert expense splits') THEN
    CREATE POLICY "Group members can insert expense splits" ON public.expense_splits FOR INSERT
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.split_expenses se
        JOIN public.group_members gm ON gm.group_id = se.group_id
        WHERE se.id = expense_splits.expense_id AND gm.user_id = auth.uid()
      ));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='expense_splits' AND policyname='Group members can delete expense splits') THEN
    CREATE POLICY "Group members can delete expense splits" ON public.expense_splits FOR DELETE
      USING (EXISTS (
        SELECT 1 FROM public.split_expenses se
        JOIN public.group_members gm ON gm.group_id = se.group_id
        WHERE se.id = expense_splits.expense_id AND gm.user_id = auth.uid()
      ));
  END IF;

  -- settlements
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='settlements' AND policyname='Users can view settlements in their groups') THEN
    CREATE POLICY "Users can view settlements in their groups" ON public.settlements FOR SELECT
      USING (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = public.settlements.group_id AND user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='settlements' AND policyname='Group members can insert settlements') THEN
    CREATE POLICY "Group members can insert settlements" ON public.settlements FOR INSERT
      WITH CHECK (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = public.settlements.group_id AND user_id = auth.uid()));
  END IF;

  -- group_invite_codes
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='group_invite_codes' AND policyname='Anyone can read invite codes') THEN
    CREATE POLICY "Anyone can read invite codes" ON public.group_invite_codes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='group_invite_codes' AND policyname='Group members can create invite codes') THEN
    CREATE POLICY "Group members can create invite codes" ON public.group_invite_codes FOR INSERT
      WITH CHECK (EXISTS (SELECT 1 FROM public.group_members WHERE group_id = public.group_invite_codes.group_id AND user_id = auth.uid()));
  END IF;
END $$;

-- 11. REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.personal_expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.split_expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.settlements;

-- 12. HANDLE_NEW_USER TRIGGER (SECURITY DEFINER — bypasses RLS on profile insert)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
