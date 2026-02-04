-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text unique not null,
  full_name text not null,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Create profiles policies
create policy "Profiles are viewable by everyone" 
  on public.profiles for select 
  using (true);

create policy "Users can insert their own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Create groups table
create table public.groups (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on groups
alter table public.groups enable row level security;

-- Create personal_expenses table
create table public.personal_expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount decimal(10, 2) not null,
  description text not null,
  category text not null,
  date timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on personal_expenses
alter table public.personal_expenses enable row level security;

-- Create personal_expenses policies
create policy "Users can view own expenses" 
  on public.personal_expenses for select 
  using (auth.uid() = user_id);

create policy "Users can insert own expenses" 
  on public.personal_expenses for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own expenses" 
  on public.personal_expenses for update 
  using (auth.uid() = user_id);

create policy "Users can delete own expenses" 
  on public.personal_expenses for delete 
  using (auth.uid() = user_id);

-- Create group_members table
create table public.group_members (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- Enable RLS on group_members
alter table public.group_members enable row level security;

-- Group policies
create policy "Users can view groups they match in group_members" 
  on public.groups for select 
  using (exists (
    select 1 from public.group_members 
    where group_id = public.groups.id and user_id = auth.uid()
  ));

create policy "Users can view members of their groups" 
  on public.group_members for select 
  using (exists (
    select 1 from public.group_members gm 
    where gm.group_id = public.group_members.group_id and gm.user_id = auth.uid()
  ));

-- Create split_expenses table
create table public.split_expenses (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  paid_by uuid references public.profiles(id) not null,
  description text not null,
  total_amount decimal(10, 2) not null,
  category text not null,
  date timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on split_expenses
alter table public.split_expenses enable row level security;

create policy "Users can view expenses in their groups" 
  on public.split_expenses for select 
  using (exists (
    select 1 from public.group_members 
    where group_id = public.split_expenses.group_id and user_id = auth.uid()
  ));

-- Create settlements table
create table public.settlements (
  id uuid default uuid_generate_v4() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  from_user uuid references public.profiles(id) not null,
  to_user uuid references public.profiles(id) not null,
  amount decimal(10, 2) not null,
  settled_at timestamptz default now()
);

-- Enable RLS on settlements
alter table public.settlements enable row level security;

create policy "Users can view settlements in their groups" 
  on public.settlements for select 
  using (exists (
    select 1 from public.group_members 
    where group_id = public.settlements.group_id and user_id = auth.uid()
  ));

-- Create Realtime publication
alter publication supabase_realtime add table public.personal_expenses;
alter publication supabase_realtime add table public.groups;
alter publication supabase_realtime add table public.split_expenses;
alter publication supabase_realtime add table public.settlements;
