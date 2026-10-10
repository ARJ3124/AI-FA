-- ============================================================
-- FinFlow AI — Database Migration
-- Run this in your Supabase SQL Editor:
--   https://supabase.com/dashboard → SQL Editor → New query
-- ============================================================

-- ai_conversations table
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ai_messages table
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id  UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role             TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content          TEXT NOT NULL CHECK (char_length(content) > 0),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id
    ON public.ai_conversations (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id
    ON public.ai_messages (conversation_id, created_at ASC);

-- ── Row Level Security ─────────────────────────────────────────────
-- Enables Supabase-native ownership enforcement as a second layer of
-- protection (the FastAPI layer is the primary enforcement point).

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages      ENABLE ROW LEVEL SECURITY;

-- Conversations: users can only access their own rows
CREATE POLICY "users_own_conversations"
    ON public.ai_conversations
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Messages: users can only access messages they own
CREATE POLICY "users_own_messages"
    ON public.ai_messages
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ── Verification queries ───────────────────────────────────────────
-- Run these to confirm the tables were created correctly:
--
-- SELECT * FROM public.ai_conversations LIMIT 5;
-- SELECT * FROM public.ai_messages LIMIT 5;
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables
--   WHERE tablename IN ('ai_conversations', 'ai_messages');
