-- =========================================================================
-- ARYAN NEWS AGENCY: UNIFIED FINANCIAL & TRANSACTION TABLES FOR SUPABASE
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- =========================================================================

-- 1. VACATION HOLDS & DISCONTINUE MASTER
CREATE TABLE IF NOT EXISTS public.discontinue (
  discontinue_id BIGSERIAL PRIMARY KEY,
  sno INTEGER,
  customer_id INTEGER NOT NULL REFERENCES public.customer(customer_id) ON DELETE CASCADE,
  publica_id INTEGER,
  temp_perma VARCHAR(20) DEFAULT 'Temporary',
  temp_from DATE,
  temp_to DATE,
  entry_date DATE DEFAULT CURRENT_DATE,
  financial_year VARCHAR(20) DEFAULT '2026-2027',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.discontinue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access discontinue" ON public.discontinue FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_discontinue_cust_date ON public.discontinue(customer_id, temp_from, temp_to);

-- 2. UNIFIED PAYMENT RECEIPTS TABLE
CREATE TABLE IF NOT EXISTS public.receipt (
  receipt_id BIGSERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES public.customer(customer_id) ON DELETE CASCADE,
  bill_id INTEGER,
  receipt_no VARCHAR(50),
  manual_rep_no VARCHAR(50),
  bill_date VARCHAR(30),
  bill_amt NUMERIC(12,2) DEFAULT 0,
  mal_recp_dt VARCHAR(30),
  month VARCHAR(30),
  year VARCHAR(20),
  due_amt NUMERIC(12,2) DEFAULT 0,
  mal_recp_amt NUMERIC(12,2) DEFAULT 0,
  balance NUMERIC(12,2) DEFAULT 0,
  less_amt NUMERIC(12,2) DEFAULT 0,
  r_amt NUMERIC(12,2) DEFAULT 0,
  cheque_no VARCHAR(50),
  cheque_date VARCHAR(30),
  cash_chq VARCHAR(20) DEFAULT 'Cash',
  narr TEXT,
  financial_year VARCHAR(20) DEFAULT '2026-2027',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.receipt ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access receipt" ON public.receipt FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_receipt_cust_year ON public.receipt(customer_id, year, month);

-- 3. UNIFIED MONTHLY BILLS TABLE
CREATE TABLE IF NOT EXISTS public.bill (
  bill_id BIGSERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES public.customer(customer_id) ON DELETE CASCADE,
  region_id INTEGER,
  bill_no INTEGER,
  month VARCHAR(30),
  year VARCHAR(20),
  due_amt NUMERIC(12,2) DEFAULT 0,
  paper_amount NUMERIC(12,2) DEFAULT 0,
  del_amt NUMERIC(12,2) DEFAULT 0,
  dis_amt NUMERIC(12,2) DEFAULT 0,
  balance NUMERIC(12,2) DEFAULT 0,
  financial_year VARCHAR(20) DEFAULT '2026-2027',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bill ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access bill" ON public.bill FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_bill_cust_period ON public.bill(customer_id, year, month);

-- 4. UNIFIED RETAIL SALES / COUNTER CASH SALES TABLE
CREATE TABLE IF NOT EXISTS public.retailsale (
  sale_id BIGSERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES public.customer(customer_id) ON DELETE SET NULL,
  publica_id INTEGER REFERENCES public.publication(publica_id),
  copies INTEGER DEFAULT 1,
  rate NUMERIC(8,2) DEFAULT 0,
  amount NUMERIC(10,2) DEFAULT 0,
  vr_date DATE DEFAULT CURRENT_DATE,
  narration TEXT,
  financial_year VARCHAR(20) DEFAULT '2026-2027',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.retailsale ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access retailsale" ON public.retailsale FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX IF NOT EXISTS idx_retailsale_date ON public.retailsale(vr_date, customer_id);
