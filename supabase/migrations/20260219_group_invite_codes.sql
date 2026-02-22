-- Migration: Group Invite Codes
-- Allows group members to generate share codes/links to invite friends
-- Created: 2026-02-19

CREATE TABLE IF NOT EXISTS public.group_invite_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  code text UNIQUE NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.group_invite_codes ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read invite codes (needed to show group name on join page)
CREATE POLICY "Anyone can read invite codes"
  ON public.group_invite_codes FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only group members can create invite codes
CREATE POLICY "Members can create invite codes"
  ON public.group_invite_codes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = public.group_invite_codes.group_id
      AND user_id = auth.uid()
    )
  );

-- Only the creator can delete their invite code
CREATE POLICY "Creator can delete invite codes"
  ON public.group_invite_codes FOR DELETE
  USING (created_by = auth.uid());

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_invite_codes;
