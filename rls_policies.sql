-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_expenses ENABLE ROW LEVEL SECURITY;

-- 2. Profiles Policies
-- Everyone can view profiles (to search for friends)
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING ( true );

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK ( auth.uid() = id );

-- Users can update own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING ( auth.uid() = id );

-- 3. Groups Policies
-- Members can view their groups
CREATE POLICY "Members can view groups" 
ON groups FOR SELECT 
USING ( 
  auth.uid() IN (SELECT user_id FROM group_members WHERE group_id = id) 
);

-- Authenticated users can create groups
CREATE POLICY "Authenticated users can create groups" 
ON groups FOR INSERT 
WITH CHECK ( auth.role() = 'authenticated' );

-- Members can update groups
CREATE POLICY "Members can update groups" 
ON groups FOR UPDATE 
USING ( 
  auth.uid() IN (SELECT user_id FROM group_members WHERE group_id = id) 
);

-- 4. Group Members Policies
-- Members can view other members in their groups
CREATE POLICY "Members can view group members" 
ON group_members FOR SELECT 
USING ( 
  group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()) 
  OR user_id = auth.uid() -- Can always see self
);

-- Authenticated users can INSERT (to join/add)
-- Note: This allows any auth user to add themselves or others to ANY group for now.
-- In a real app, you'd restrict this to "Add self if invited" or "Creator adds members".
-- For this MVP, we allow open addition to facilitate the "Add Member" feature easily.
CREATE POLICY "Authenticated users can add members" 
ON group_members FOR INSERT 
WITH CHECK ( auth.role() = 'authenticated' );

-- Members can leave (delete self)
CREATE POLICY "Users can leave groups" 
ON group_members FOR DELETE 
USING ( user_id = auth.uid() );

-- 5. Split Expenses Policies
-- Members can view expenses
CREATE POLICY "Members can view group expenses" 
ON split_expenses FOR SELECT 
USING ( 
  group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()) 
);

-- Members can add expenses
CREATE POLICY "Members can add group expenses" 
ON split_expenses FOR INSERT 
WITH CHECK ( 
  group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()) 
);

-- Members can update/delete expenses
CREATE POLICY "Members can update group expenses" 
ON split_expenses FOR UPDATE 
USING ( 
  group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()) 
);

-- 6. Expense Splits Policies
-- View splits if you act on the parent expense (which requires group membership)
-- Detailed check: expense_id belongs to a group I am in.
CREATE POLICY "Members can view splits" 
ON expense_splits FOR SELECT 
USING ( 
  expense_id IN (
    SELECT id FROM split_expenses 
    WHERE group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  )
);

-- Insert splits if member of group
CREATE POLICY "Members can add splits" 
ON expense_splits FOR INSERT 
WITH CHECK ( 
  expense_id IN (
    SELECT id FROM split_expenses 
    WHERE group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  )
);

-- 7. Settlements Policies
-- View settlements
CREATE POLICY "Members can view settlements" 
ON settlements FOR SELECT 
USING ( 
  group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()) 
);

-- Add settlements
CREATE POLICY "Members can add settlements" 
ON settlements FOR INSERT 
WITH CHECK ( 
  group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()) 
);

-- 8. Personal Expenses Policies (already worked on earlier, but ensuring)
CREATE POLICY "Individuals can view own personal expenses" 
ON personal_expenses FOR SELECT 
USING ( user_id = auth.uid() );

CREATE POLICY "Individuals can insert own personal expenses" 
ON personal_expenses FOR INSERT 
WITH CHECK ( user_id = auth.uid() );

CREATE POLICY "Individuals can update own personal expenses" 
ON personal_expenses FOR UPDATE 
USING ( user_id = auth.uid() );

CREATE POLICY "Individuals can delete own personal expenses" 
ON personal_expenses FOR DELETE 
USING ( user_id = auth.uid() );
