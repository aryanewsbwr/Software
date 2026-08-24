-- ==============================================================================
-- ARYAN NEWS AGENCY - SUPABASE POSTGRESQL MASTER REPLICA SCHEMA
-- Complete 1:1 conversion of MySQL 5.0 Legacy Database to Supabase PostgreSQL
-- ==============================================================================

-- 1. Publisher Master Table
CREATE TABLE IF NOT EXISTS public.publisher (
    publish_id INT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    phone TEXT,
    mobile TEXT,
    fax TEXT,
    email TEXT,
    website TEXT,
    category TEXT DEFAULT 'Newspaper',
    type TEXT DEFAULT 'Publisher'
);

-- 2. Publication Master Table (Newspapers & Magazines)
CREATE TABLE IF NOT EXISTS public.publication (
    publica_id INT PRIMARY KEY,
    public_name TEXT NOT NULL,
    type_p TEXT DEFAULT 'Newspaper',
    publish_id INT REFERENCES public.publisher(publish_id) ON DELETE SET NULL,
    abrv TEXT,
    circulation TEXT DEFAULT 'Morning',
    duration TEXT,
    magzine_day INT DEFAULT 0,
    magzine_month INT DEFAULT 0,
    chr_del INT DEFAULT 0,
    pub_hindi TEXT
);

-- 3. Region Master Table (Delivery Zones)
CREATE TABLE IF NOT EXISTS public.region (
    region_id INT PRIMARY KEY,
    region_name TEXT NOT NULL,
    zone TEXT
);

-- 4. Hawker Master Table (Delivery Agents)
CREATE TABLE IF NOT EXISTS public.hawker (
    hawker_id INT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    phone TEXT,
    mobile TEXT,
    region_id INT REFERENCES public.region(region_id) ON DELETE SET NULL,
    commission_rate NUMERIC DEFAULT 0
);

-- 5. Customer Master Table (Bilingual Customer Registry)
CREATE TABLE IF NOT EXISTS public.customer (
    customer_id BIGINT PRIMARY KEY,
    name_eng TEXT NOT NULL,
    type_cust INT DEFAULT -1,
    name_hindi TEXT,
    add1 TEXT,
    add2 TEXT,
    phone TEXT,
    security_deposit NUMERIC DEFAULT 0,
    type TEXT,
    priority INT DEFAULT 1,
    self_agent INT DEFAULT -1,
    font_type INT DEFAULT -1,
    dueamount NUMERIC DEFAULT 0,
    region_id INT REFERENCES public.region(region_id) ON DELETE SET NULL,
    paid TEXT DEFAULT 'P',
    delivery NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    govt_supply INT DEFAULT 0,
    hindi_add TEXT,
    cbal NUMERIC DEFAULT 0,
    pmonth TEXT,
    pyear TEXT
);

CREATE INDEX IF NOT EXISTS idx_customer_priority ON public.customer (priority);
CREATE INDEX IF NOT EXISTS idx_customer_region ON public.customer (region_id);
CREATE INDEX IF NOT EXISTS idx_customer_search ON public.customer (name_eng, phone);

-- 6. Customer Subscriptions Table (cust info)
CREATE TABLE IF NOT EXISTS public.customer_detail (
    sno BIGINT PRIMARY KEY,
    customer_id BIGINT REFERENCES public.customer(customer_id) ON DELETE CASCADE,
    publica_id INT REFERENCES public.publication(publica_id) ON DELETE CASCADE,
    hawker_id INT REFERENCES public.hawker(hawker_id) ON DELETE SET NULL,
    qty INT DEFAULT 1,
    circulation TEXT DEFAULT 'Morning',
    s_date DATE,
    c_date DATE,
    from_day TEXT DEFAULT '1-7', -- 1=Sun .. 7=Sat
    hawk_sub INT DEFAULT -1,
    dis NUMERIC DEFAULT 0,
    dely NUMERIC DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_cust_detail_cust ON public.customer_detail (customer_id);

-- 7. Publication Day-of-Week Rates (6.1 rate)
CREATE TABLE IF NOT EXISTS public.rate (
    rate_id BIGSERIAL PRIMARY KEY,
    publica_id INT NOT NULL REFERENCES public.publication(publica_id) ON DELETE CASCADE,
    rate NUMERIC NOT NULL DEFAULT 5.00,
    dayofweek INT NOT NULL CHECK (dayofweek BETWEEN 1 AND 7), -- 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
    UNIQUE(publica_id, dayofweek)
);

CREATE INDEX IF NOT EXISTS idx_rate_pub_day ON public.rate (publica_id, dayofweek);

-- 8. Historical / Scheduled Rate Changes (6.2 rate)
CREATE TABLE IF NOT EXISTS public.ratechange (
    change_id BIGSERIAL PRIMARY KEY,
    publica_id INT NOT NULL REFERENCES public.publication(publica_id) ON DELETE CASCADE,
    old_rate NUMERIC,
    new_rate NUMERIC NOT NULL,
    dated DATE NOT NULL,
    dayofweek INT NOT NULL CHECK (dayofweek BETWEEN 1 AND 7)
);

CREATE INDEX IF NOT EXISTS idx_ratechange_lookup ON public.ratechange (publica_id, dayofweek, dated);

-- 9. Press Holidays (7holiday)
CREATE TABLE IF NOT EXISTS public.holiday (
    holiday_id BIGSERIAL PRIMARY KEY,
    oc_date DATE NOT NULL,
    occasion TEXT,
    publica_id INT REFERENCES public.publication(publica_id) ON DELETE CASCADE -- NULL = all publications
);

CREATE INDEX IF NOT EXISTS idx_holiday_date ON public.holiday (oc_date, publica_id);

-- 10. Counter / Retail Cash Sales (9retail sale)
CREATE TABLE IF NOT EXISTS public.retailsale (
    retail_id BIGSERIAL PRIMARY KEY,
    vr_date DATE NOT NULL,
    customer_id BIGINT,
    publica_id INT REFERENCES public.publication(publica_id) ON DELETE SET NULL,
    copies INT DEFAULT 1,
    rate NUMERIC DEFAULT 0,
    amt NUMERIC DEFAULT 0,
    narr TEXT
);

-- 11. Customer Vacation Holds & Permanent Stops (10 discontinue)
CREATE TABLE IF NOT EXISTS public.discontinue (
    discontinue_id BIGSERIAL PRIMARY KEY,
    sno INT,
    entry_date DATE DEFAULT CURRENT_DATE,
    customer_id BIGINT NOT NULL REFERENCES public.customer(customer_id) ON DELETE CASCADE,
    publica_id INT REFERENCES public.publication(publica_id) ON DELETE CASCADE,
    temp_perma TEXT NOT NULL CHECK (temp_perma IN ('T', 'P', 'Temporary', 'Permanent')),
    temp_from DATE NOT NULL,
    temp_to DATE,
    s_date DATE,
    c_date DATE,
    hawker_id INT REFERENCES public.hawker(hawker_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_discontinue_cust ON public.discontinue (customer_id, temp_from, temp_to);

-- 12. Publication Discontinue / Press Suspensions (11 publication discontinue)
CREATE TABLE IF NOT EXISTS public.publication_discontinue (
    pub_discontinue_id BIGSERIAL PRIMARY KEY,
    publica_id INT NOT NULL REFERENCES public.publication(publica_id) ON DELETE CASCADE,
    from_date DATE NOT NULL,
    to_date DATE
);

-- 13. Receipt Book Issue to Collection Agents (12 recipt issue)
CREATE TABLE IF NOT EXISTS public.receipt_issue (
    sno BIGSERIAL PRIMARY KEY,
    collect_id INT NOT NULL,
    receipt_from TEXT NOT NULL,
    receipt_to TEXT NOT NULL,
    issue_date DATE NOT NULL,
    rec_date DATE
);

-- 14. Payment Receipts against Bills & Customer Ledger (13 payment recipt)
CREATE TABLE IF NOT EXISTS public.payment_receipt (
    receipt_id BIGSERIAL PRIMARY KEY,
    bill_id BIGINT,
    receipt_no TEXT,
    manual_rep_no TEXT,
    bill_date DATE,
    bill_amt NUMERIC DEFAULT 0,
    mal_recp_dt DATE,
    month TEXT,
    year TEXT,
    due_amt NUMERIC DEFAULT 0,
    mal_recp_amt NUMERIC DEFAULT 0,
    balance NUMERIC DEFAULT 0,
    less_amt NUMERIC DEFAULT 0,
    r_amt NUMERIC DEFAULT 0,
    cheque_no TEXT,
    cheque_date TEXT,
    debit NUMERIC DEFAULT 0,
    credit NUMERIC DEFAULT 0,
    cash_chq TEXT DEFAULT 'Cash',
    narr TEXT,
    customer_id BIGINT NOT NULL REFERENCES public.customer(customer_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payment_receipt_cust ON public.payment_receipt (customer_id, mal_recp_dt);

-- 15. Monthly Detailed Billed Items (14.1 bill)
CREATE TABLE IF NOT EXISTS public.bill (
    bill_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES public.customer(customer_id) ON DELETE CASCADE,
    publica_id INT REFERENCES public.publication(publica_id) ON DELETE CASCADE,
    region_id INT REFERENCES public.region(region_id) ON DELETE SET NULL,
    qty INT DEFAULT 0,
    rate NUMERIC DEFAULT 0,
    d_charges NUMERIC DEFAULT 0,
    total_amt NUMERIC DEFAULT 0,
    month TEXT NOT NULL,
    year TEXT NOT NULL,
    sno INT
);

CREATE INDEX IF NOT EXISTS idx_bill_cust_month_year ON public.bill (customer_id, year, month);

-- 16. Monthly Bill Delivery Charges (14.2 bill deliver charges)
CREATE TABLE IF NOT EXISTS public.bill_delivery_charges (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES public.customer(customer_id) ON DELETE CASCADE,
    region_id INT,
    publica_id INT,
    month TEXT NOT NULL,
    year TEXT NOT NULL,
    dely NUMERIC DEFAULT 0,
    sno INT
);

-- 17. Monthly Bill Summary Header (14.3 billl no..)
CREATE TABLE IF NOT EXISTS public.bill_header (
    bill_id BIGINT PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES public.customer(customer_id) ON DELETE CASCADE,
    region_id INT,
    due_amt NUMERIC DEFAULT 0,
    del_amt NUMERIC DEFAULT 0,
    dis_amt NUMERIC DEFAULT 0,
    month TEXT NOT NULL,
    year TEXT NOT NULL,
    balance NUMERIC DEFAULT 0,
    UNIQUE(customer_id, month, year)
);

-- 18. Financial Year Master (14.4 year,perod selectiion)
CREATE TABLE IF NOT EXISTS public.year (
    year_id INT PRIMARY KEY,
    start_year INT NOT NULL,
    end_year INT NOT NULL
);

-- 19. Collection Agents Master
CREATE TABLE IF NOT EXISTS public.collector (
    collect_id INT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT
);

-- 20. Publisher Purchase Invoices (purchase)
CREATE TABLE IF NOT EXISTS public.purchase (
    purchase_id INT PRIMARY KEY,
    publisher_id INT REFERENCES public.publisher(publish_id) ON DELETE SET NULL,
    bill_no TEXT,
    bill_date DATE,
    r_date DATE,
    total NUMERIC DEFAULT 0,
    add_less NUMERIC DEFAULT 0,
    net_amt NUMERIC DEFAULT 0
);

-- 21. Publisher Purchase Items (purchasedetail)
CREATE TABLE IF NOT EXISTS public.purchase_detail (
    purchase_detail_id BIGSERIAL PRIMARY KEY,
    purchase_id INT REFERENCES public.purchase(purchase_id) ON DELETE CASCADE,
    publica_id INT REFERENCES public.publication(publica_id) ON DELETE CASCADE,
    qty INT DEFAULT 0,
    rate NUMERIC DEFAULT 0,
    amt NUMERIC DEFAULT 0
);

-- Disable / Configure RLS for seamless web client usage
ALTER TABLE public.publisher DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.region DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hawker DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_detail DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratechange DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.holiday DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.retailsale DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.discontinue DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_discontinue DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_issue DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipt DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_delivery_charges DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_header DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.year DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.collector DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_detail DISABLE ROW LEVEL SECURITY;
