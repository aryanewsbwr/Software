-- Migration: Create whatsapp_messages table for tracking WhatsApp Cloud API bill dispatch
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id TEXT NOT NULL,
    bill_id TEXT NOT NULL,
    phone TEXT NOT NULL,
    wamid TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'sent', 'delivered', 'read', 'failed')),
    error_code TEXT,
    error_json JSONB,
    attempts INT DEFAULT 0,
    media_id TEXT,
    bill_month TEXT,
    total_amount NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for queue polling and customer lookups
CREATE INDEX IF NOT EXISTS idx_wa_messages_status ON public.whatsapp_messages(status, created_at);
CREATE INDEX IF NOT EXISTS idx_wa_messages_bill_id ON public.whatsapp_messages(bill_id);
CREATE INDEX IF NOT EXISTS idx_wa_messages_customer_id ON public.whatsapp_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_wa_messages_wamid ON public.whatsapp_messages(wamid);

-- Ensure a bill cannot be sent multiple times successfully (idempotency)
CREATE UNIQUE INDEX IF NOT EXISTS uq_wa_messages_bill_success 
ON public.whatsapp_messages(bill_id) 
WHERE status IN ('sent', 'delivered', 'read');

-- Enable Row Level Security (RLS)
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read and manage messages
CREATE POLICY "Allow authenticated read on whatsapp_messages"
ON public.whatsapp_messages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow service role full access on whatsapp_messages"
ON public.whatsapp_messages FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
