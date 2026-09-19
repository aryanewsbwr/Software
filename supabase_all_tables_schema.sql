-- ==========================================================
-- SUPABASE POSTGRESQL SCHEMA FOR ARYAN NEWS AGENCY
-- Total Tables Extracted: 271
-- ==========================================================

CREATE TABLE IF NOT EXISTS "aread" (
  "Area_id" BIGINT,
  "Area_name" TEXT
);
ALTER TABLE "aread" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for aread" ON "aread";
CREATE POLICY "Allow public read-write for aread" ON "aread" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "balancetransfer" (
  "region_id" BIGINT,
  "Detail" TEXT
);
ALTER TABLE "balancetransfer" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for balancetransfer" ON "balancetransfer";
CREATE POLICY "Allow public read-write for balancetransfer" ON "balancetransfer" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "bill20072008" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "bill20072008" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for bill20072008" ON "bill20072008";
CREATE POLICY "Allow public read-write for bill20072008" ON "bill20072008" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "bill20082009" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "bill20082009" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for bill20082009" ON "bill20082009";
CREATE POLICY "Allow public read-write for bill20082009" ON "bill20082009" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "bill20092010" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "bill20092010" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for bill20092010" ON "bill20092010";
CREATE POLICY "Allow public read-write for bill20092010" ON "bill20092010" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "bill20102011" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "bill20102011" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for bill20102011" ON "bill20102011";
CREATE POLICY "Allow public read-write for bill20102011" ON "bill20102011" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "bill20122013" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "bill20122013" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for bill20122013" ON "bill20122013";
CREATE POLICY "Allow public read-write for bill20122013" ON "bill20122013" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "bill20132014" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "bill20132014" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for bill20132014" ON "bill20132014";
CREATE POLICY "Allow public read-write for bill20132014" ON "bill20132014" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "bill20142015" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "bill20142015" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for bill20142015" ON "bill20142015";
CREATE POLICY "Allow public read-write for bill20142015" ON "bill20142015" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "bill20152016" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "bill20152016" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for bill20152016" ON "bill20152016";
CREATE POLICY "Allow public read-write for bill20152016" ON "bill20152016" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "bill20162017" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "bill20162017" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for bill20162017" ON "bill20162017";
CREATE POLICY "Allow public read-write for bill20162017" ON "bill20162017" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "bill20172018" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "bill20172018" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for bill20172018" ON "bill20172018";
CREATE POLICY "Allow public read-write for bill20172018" ON "bill20172018" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "bill20182019" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "bill20182019" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for bill20182019" ON "bill20182019";
CREATE POLICY "Allow public read-write for bill20182019" ON "bill20182019" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "bill20192020" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "bill20192020" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for bill20192020" ON "bill20192020";
CREATE POLICY "Allow public read-write for bill20192020" ON "bill20192020" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "bill20202021" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "bill20202021" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for bill20202021" ON "bill20202021";
CREATE POLICY "Allow public read-write for bill20202021" ON "bill20202021" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "bill20212022" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "bill20212022" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for bill20212022" ON "bill20212022";
CREATE POLICY "Allow public read-write for bill20212022" ON "bill20212022" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "bill20222023" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "bill20222023" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for bill20222023" ON "bill20222023";
CREATE POLICY "Allow public read-write for bill20222023" ON "bill20222023" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "bill20232024" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "bill20232024" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for bill20232024" ON "bill20232024";
CREATE POLICY "Allow public read-write for bill20232024" ON "bill20232024" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "bill20242025" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "bill20242025" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for bill20242025" ON "bill20242025";
CREATE POLICY "Allow public read-write for bill20242025" ON "bill20242025" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "bill20252026" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "bill20252026" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for bill20252026" ON "bill20252026";
CREATE POLICY "Allow public read-write for bill20252026" ON "bill20252026" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billdel20072008" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "Dely" BIGINT,
  "sno" BIGINT
);
ALTER TABLE "billdel20072008" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billdel20072008" ON "billdel20072008";
CREATE POLICY "Allow public read-write for billdel20072008" ON "billdel20072008" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billdel20082009" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "Dely" BIGINT,
  "sno" BIGINT
);
ALTER TABLE "billdel20082009" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billdel20082009" ON "billdel20082009";
CREATE POLICY "Allow public read-write for billdel20082009" ON "billdel20082009" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billdel20092010" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "Dely" BIGINT,
  "sno" BIGINT
);
ALTER TABLE "billdel20092010" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billdel20092010" ON "billdel20092010";
CREATE POLICY "Allow public read-write for billdel20092010" ON "billdel20092010" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billdel20102011" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "Dely" BIGINT,
  "sno" BIGINT
);
ALTER TABLE "billdel20102011" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billdel20102011" ON "billdel20102011";
CREATE POLICY "Allow public read-write for billdel20102011" ON "billdel20102011" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billdel20112012" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "Dely" BIGINT,
  "sno" BIGINT
);
ALTER TABLE "billdel20112012" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billdel20112012" ON "billdel20112012";
CREATE POLICY "Allow public read-write for billdel20112012" ON "billdel20112012" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billdel20122013" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "Dely" BIGINT,
  "sno" BIGINT
);
ALTER TABLE "billdel20122013" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billdel20122013" ON "billdel20122013";
CREATE POLICY "Allow public read-write for billdel20122013" ON "billdel20122013" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billdel20132014" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "Dely" BIGINT,
  "sno" BIGINT
);
ALTER TABLE "billdel20132014" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billdel20132014" ON "billdel20132014";
CREATE POLICY "Allow public read-write for billdel20132014" ON "billdel20132014" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billdel20142015" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "Dely" BIGINT,
  "sno" BIGINT
);
ALTER TABLE "billdel20142015" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billdel20142015" ON "billdel20142015";
CREATE POLICY "Allow public read-write for billdel20142015" ON "billdel20142015" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billdel20152016" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "Dely" BIGINT,
  "sno" BIGINT
);
ALTER TABLE "billdel20152016" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billdel20152016" ON "billdel20152016";
CREATE POLICY "Allow public read-write for billdel20152016" ON "billdel20152016" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billdel20162017" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "Dely" BIGINT,
  "sno" BIGINT
);
ALTER TABLE "billdel20162017" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billdel20162017" ON "billdel20162017";
CREATE POLICY "Allow public read-write for billdel20162017" ON "billdel20162017" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billdel20172018" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "Dely" BIGINT,
  "sno" BIGINT
);
ALTER TABLE "billdel20172018" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billdel20172018" ON "billdel20172018";
CREATE POLICY "Allow public read-write for billdel20172018" ON "billdel20172018" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billdel20182019" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "Dely" BIGINT,
  "sno" BIGINT
);
ALTER TABLE "billdel20182019" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billdel20182019" ON "billdel20182019";
CREATE POLICY "Allow public read-write for billdel20182019" ON "billdel20182019" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billdel20192020" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "Dely" BIGINT,
  "sno" BIGINT
);
ALTER TABLE "billdel20192020" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billdel20192020" ON "billdel20192020";
CREATE POLICY "Allow public read-write for billdel20192020" ON "billdel20192020" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billdel20202021" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "Dely" BIGINT,
  "sno" BIGINT
);
ALTER TABLE "billdel20202021" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billdel20202021" ON "billdel20202021";
CREATE POLICY "Allow public read-write for billdel20202021" ON "billdel20202021" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billdel20212022" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "Dely" BIGINT,
  "sno" BIGINT
);
ALTER TABLE "billdel20212022" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billdel20212022" ON "billdel20212022";
CREATE POLICY "Allow public read-write for billdel20212022" ON "billdel20212022" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billdel20222023" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "Dely" BIGINT,
  "sno" BIGINT
);
ALTER TABLE "billdel20222023" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billdel20222023" ON "billdel20222023";
CREATE POLICY "Allow public read-write for billdel20222023" ON "billdel20222023" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billdel20232024" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "Dely" BIGINT,
  "sno" BIGINT
);
ALTER TABLE "billdel20232024" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billdel20232024" ON "billdel20232024";
CREATE POLICY "Allow public read-write for billdel20232024" ON "billdel20232024" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billdel20242025" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "Dely" BIGINT,
  "sno" BIGINT
);
ALTER TABLE "billdel20242025" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billdel20242025" ON "billdel20242025";
CREATE POLICY "Allow public read-write for billdel20242025" ON "billdel20242025" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billdel20252026" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "Dely" BIGINT,
  "sno" BIGINT
);
ALTER TABLE "billdel20252026" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billdel20252026" ON "billdel20252026";
CREATE POLICY "Allow public read-write for billdel20252026" ON "billdel20252026" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billno20072008" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "billno20072008" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billno20072008" ON "billno20072008";
CREATE POLICY "Allow public read-write for billno20072008" ON "billno20072008" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billno20082009" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "billno20082009" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billno20082009" ON "billno20082009";
CREATE POLICY "Allow public read-write for billno20082009" ON "billno20082009" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billno20092010" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "billno20092010" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billno20092010" ON "billno20092010";
CREATE POLICY "Allow public read-write for billno20092010" ON "billno20092010" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billno20102011" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "billno20102011" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billno20102011" ON "billno20102011";
CREATE POLICY "Allow public read-write for billno20102011" ON "billno20102011" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billno20112012" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "billno20112012" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billno20112012" ON "billno20112012";
CREATE POLICY "Allow public read-write for billno20112012" ON "billno20112012" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billno20122013" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "billno20122013" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billno20122013" ON "billno20122013";
CREATE POLICY "Allow public read-write for billno20122013" ON "billno20122013" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billno20132014" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "billno20132014" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billno20132014" ON "billno20132014";
CREATE POLICY "Allow public read-write for billno20132014" ON "billno20132014" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billno20142015" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "billno20142015" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billno20142015" ON "billno20142015";
CREATE POLICY "Allow public read-write for billno20142015" ON "billno20142015" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billno20152016" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "billno20152016" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billno20152016" ON "billno20152016";
CREATE POLICY "Allow public read-write for billno20152016" ON "billno20152016" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billno20162017" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "billno20162017" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billno20162017" ON "billno20162017";
CREATE POLICY "Allow public read-write for billno20162017" ON "billno20162017" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billno20172018" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "billno20172018" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billno20172018" ON "billno20172018";
CREATE POLICY "Allow public read-write for billno20172018" ON "billno20172018" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billno20182019" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "billno20182019" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billno20182019" ON "billno20182019";
CREATE POLICY "Allow public read-write for billno20182019" ON "billno20182019" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billno20192020" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "billno20192020" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billno20192020" ON "billno20192020";
CREATE POLICY "Allow public read-write for billno20192020" ON "billno20192020" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billno20202021" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "billno20202021" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billno20202021" ON "billno20202021";
CREATE POLICY "Allow public read-write for billno20202021" ON "billno20202021" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billno20212022" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "billno20212022" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billno20212022" ON "billno20212022";
CREATE POLICY "Allow public read-write for billno20212022" ON "billno20212022" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billno20222023" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "billno20222023" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billno20222023" ON "billno20222023";
CREATE POLICY "Allow public read-write for billno20222023" ON "billno20222023" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billno20232024" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "billno20232024" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billno20232024" ON "billno20232024";
CREATE POLICY "Allow public read-write for billno20232024" ON "billno20232024" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billno20242025" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "billno20242025" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billno20242025" ON "billno20242025";
CREATE POLICY "Allow public read-write for billno20242025" ON "billno20242025" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billno20252026" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "billno20252026" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billno20252026" ON "billno20252026";
CREATE POLICY "Allow public read-write for billno20252026" ON "billno20252026" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billprocess20072008" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "rate" NUMERIC,
  "weekdays" BIGINT,
  "Qty" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "dated" TEXT,
  "sno" BIGINT,
  "retail_id" BIGINT,
  "sqty" BIGINT
);
ALTER TABLE "billprocess20072008" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billprocess20072008" ON "billprocess20072008";
CREATE POLICY "Allow public read-write for billprocess20072008" ON "billprocess20072008" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billprocess20082009" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "rate" NUMERIC,
  "weekdays" BIGINT,
  "Qty" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "dated" TEXT,
  "sno" BIGINT,
  "retail_id" BIGINT,
  "sqty" BIGINT
);
ALTER TABLE "billprocess20082009" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billprocess20082009" ON "billprocess20082009";
CREATE POLICY "Allow public read-write for billprocess20082009" ON "billprocess20082009" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billprocess20092010" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "rate" NUMERIC,
  "weekdays" BIGINT,
  "Qty" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "dated" TEXT,
  "sno" BIGINT,
  "retail_id" BIGINT,
  "sqty" BIGINT
);
ALTER TABLE "billprocess20092010" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billprocess20092010" ON "billprocess20092010";
CREATE POLICY "Allow public read-write for billprocess20092010" ON "billprocess20092010" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billprocess20102011" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "rate" NUMERIC,
  "weekdays" BIGINT,
  "Qty" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "dated" TEXT,
  "sno" BIGINT,
  "retail_id" BIGINT,
  "sqty" BIGINT
);
ALTER TABLE "billprocess20102011" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billprocess20102011" ON "billprocess20102011";
CREATE POLICY "Allow public read-write for billprocess20102011" ON "billprocess20102011" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billprocess20112012" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "rate" NUMERIC,
  "weekdays" BIGINT,
  "Qty" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "dated" TEXT,
  "sno" BIGINT,
  "retail_id" BIGINT,
  "sqty" BIGINT
);
ALTER TABLE "billprocess20112012" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billprocess20112012" ON "billprocess20112012";
CREATE POLICY "Allow public read-write for billprocess20112012" ON "billprocess20112012" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billprocess20122013" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "rate" NUMERIC,
  "weekdays" BIGINT,
  "Qty" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "dated" TEXT,
  "sno" BIGINT,
  "retail_id" BIGINT,
  "sqty" BIGINT
);
ALTER TABLE "billprocess20122013" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billprocess20122013" ON "billprocess20122013";
CREATE POLICY "Allow public read-write for billprocess20122013" ON "billprocess20122013" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billprocess20132014" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "rate" NUMERIC,
  "weekdays" BIGINT,
  "Qty" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "dated" TEXT,
  "sno" BIGINT,
  "retail_id" BIGINT,
  "sqty" BIGINT
);
ALTER TABLE "billprocess20132014" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billprocess20132014" ON "billprocess20132014";
CREATE POLICY "Allow public read-write for billprocess20132014" ON "billprocess20132014" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billprocess20142015" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "rate" NUMERIC,
  "weekdays" BIGINT,
  "Qty" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "dated" TEXT,
  "sno" BIGINT,
  "retail_id" BIGINT,
  "sqty" BIGINT
);
ALTER TABLE "billprocess20142015" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billprocess20142015" ON "billprocess20142015";
CREATE POLICY "Allow public read-write for billprocess20142015" ON "billprocess20142015" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billprocess20152016" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "rate" NUMERIC,
  "weekdays" BIGINT,
  "Qty" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "dated" TEXT,
  "sno" BIGINT,
  "retail_id" BIGINT,
  "sqty" BIGINT
);
ALTER TABLE "billprocess20152016" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billprocess20152016" ON "billprocess20152016";
CREATE POLICY "Allow public read-write for billprocess20152016" ON "billprocess20152016" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billprocess20162017" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "rate" NUMERIC,
  "weekdays" BIGINT,
  "Qty" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "dated" TEXT,
  "sno" BIGINT,
  "retail_id" BIGINT,
  "sqty" BIGINT
);
ALTER TABLE "billprocess20162017" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billprocess20162017" ON "billprocess20162017";
CREATE POLICY "Allow public read-write for billprocess20162017" ON "billprocess20162017" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billprocess20172018" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "rate" NUMERIC,
  "weekdays" BIGINT,
  "Qty" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "dated" TEXT,
  "sno" BIGINT,
  "retail_id" BIGINT,
  "sqty" BIGINT
);
ALTER TABLE "billprocess20172018" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billprocess20172018" ON "billprocess20172018";
CREATE POLICY "Allow public read-write for billprocess20172018" ON "billprocess20172018" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billprocess20182019" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "rate" NUMERIC,
  "weekdays" BIGINT,
  "Qty" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "dated" TEXT,
  "sno" BIGINT,
  "retail_id" BIGINT,
  "sqty" BIGINT
);
ALTER TABLE "billprocess20182019" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billprocess20182019" ON "billprocess20182019";
CREATE POLICY "Allow public read-write for billprocess20182019" ON "billprocess20182019" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billprocess20192020" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "rate" NUMERIC,
  "weekdays" BIGINT,
  "Qty" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "dated" TEXT,
  "sno" BIGINT,
  "retail_id" BIGINT,
  "sqty" BIGINT
);
ALTER TABLE "billprocess20192020" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billprocess20192020" ON "billprocess20192020";
CREATE POLICY "Allow public read-write for billprocess20192020" ON "billprocess20192020" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billprocess20202021" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "rate" NUMERIC,
  "weekdays" BIGINT,
  "Qty" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "dated" TEXT,
  "sno" BIGINT,
  "retail_id" BIGINT,
  "sqty" BIGINT
);
ALTER TABLE "billprocess20202021" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billprocess20202021" ON "billprocess20202021";
CREATE POLICY "Allow public read-write for billprocess20202021" ON "billprocess20202021" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billprocess20212022" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "rate" NUMERIC,
  "weekdays" BIGINT,
  "Qty" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "dated" TEXT,
  "sno" BIGINT,
  "retail_id" BIGINT,
  "sqty" BIGINT
);
ALTER TABLE "billprocess20212022" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billprocess20212022" ON "billprocess20212022";
CREATE POLICY "Allow public read-write for billprocess20212022" ON "billprocess20212022" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billprocess20222023" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "rate" NUMERIC,
  "weekdays" BIGINT,
  "Qty" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "dated" TEXT,
  "sno" BIGINT,
  "retail_id" BIGINT,
  "sqty" BIGINT
);
ALTER TABLE "billprocess20222023" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billprocess20222023" ON "billprocess20222023";
CREATE POLICY "Allow public read-write for billprocess20222023" ON "billprocess20222023" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billprocess20232024" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "rate" NUMERIC,
  "weekdays" BIGINT,
  "Qty" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "dated" TEXT,
  "sno" BIGINT,
  "retail_id" BIGINT,
  "sqty" BIGINT
);
ALTER TABLE "billprocess20232024" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billprocess20232024" ON "billprocess20232024";
CREATE POLICY "Allow public read-write for billprocess20232024" ON "billprocess20232024" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billprocess20242025" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "rate" NUMERIC,
  "weekdays" BIGINT,
  "Qty" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "dated" TEXT,
  "sno" BIGINT,
  "retail_id" BIGINT,
  "sqty" BIGINT
);
ALTER TABLE "billprocess20242025" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billprocess20242025" ON "billprocess20242025";
CREATE POLICY "Allow public read-write for billprocess20242025" ON "billprocess20242025" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "billprocess20252026" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "rate" NUMERIC,
  "weekdays" BIGINT,
  "Qty" BIGINT,
  "month" TEXT,
  "year" TEXT,
  "dated" TEXT,
  "sno" BIGINT,
  "retail_id" BIGINT,
  "sqty" BIGINT
);
ALTER TABLE "billprocess20252026" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for billprocess20252026" ON "billprocess20252026";
CREATE POLICY "Allow public read-write for billprocess20252026" ON "billprocess20252026" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collect" (
  "Collect_id" BIGINT,
  "name" TEXT,
  "address" TEXT,
  "city" TEXT,
  "phone" TEXT,
  "mobile" TEXT
);
ALTER TABLE "collect" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collect" ON "collect";
CREATE POLICY "Allow public read-write for collect" ON "collect" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collectagent20072008" (
  "Customer_id" BIGINT,
  "Collect_id" BIGINT
);
ALTER TABLE "collectagent20072008" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collectagent20072008" ON "collectagent20072008";
CREATE POLICY "Allow public read-write for collectagent20072008" ON "collectagent20072008" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collectagent20082009" (
  "Customer_id" BIGINT,
  "Collect_id" BIGINT
);
ALTER TABLE "collectagent20082009" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collectagent20082009" ON "collectagent20082009";
CREATE POLICY "Allow public read-write for collectagent20082009" ON "collectagent20082009" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collectagent20092010" (
  "Customer_id" BIGINT,
  "Collect_id" BIGINT
);
ALTER TABLE "collectagent20092010" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collectagent20092010" ON "collectagent20092010";
CREATE POLICY "Allow public read-write for collectagent20092010" ON "collectagent20092010" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collectagent20102011" (
  "Customer_id" BIGINT,
  "Collect_id" BIGINT
);
ALTER TABLE "collectagent20102011" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collectagent20102011" ON "collectagent20102011";
CREATE POLICY "Allow public read-write for collectagent20102011" ON "collectagent20102011" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collectagent20112012" (
  "Customer_id" BIGINT,
  "Collect_id" BIGINT
);
ALTER TABLE "collectagent20112012" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collectagent20112012" ON "collectagent20112012";
CREATE POLICY "Allow public read-write for collectagent20112012" ON "collectagent20112012" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collectagent20122013" (
  "Customer_id" BIGINT,
  "Collect_id" BIGINT
);
ALTER TABLE "collectagent20122013" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collectagent20122013" ON "collectagent20122013";
CREATE POLICY "Allow public read-write for collectagent20122013" ON "collectagent20122013" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collectagent20132014" (
  "Customer_id" BIGINT,
  "Collect_id" BIGINT
);
ALTER TABLE "collectagent20132014" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collectagent20132014" ON "collectagent20132014";
CREATE POLICY "Allow public read-write for collectagent20132014" ON "collectagent20132014" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collectagent20142015" (
  "Customer_id" BIGINT,
  "Collect_id" BIGINT
);
ALTER TABLE "collectagent20142015" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collectagent20142015" ON "collectagent20142015";
CREATE POLICY "Allow public read-write for collectagent20142015" ON "collectagent20142015" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collectagent20152016" (
  "Customer_id" BIGINT,
  "Collect_id" BIGINT
);
ALTER TABLE "collectagent20152016" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collectagent20152016" ON "collectagent20152016";
CREATE POLICY "Allow public read-write for collectagent20152016" ON "collectagent20152016" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collectagent20162017" (
  "Customer_id" BIGINT,
  "Collect_id" BIGINT
);
ALTER TABLE "collectagent20162017" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collectagent20162017" ON "collectagent20162017";
CREATE POLICY "Allow public read-write for collectagent20162017" ON "collectagent20162017" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collectagent20172018" (
  "Customer_id" BIGINT,
  "Collect_id" BIGINT
);
ALTER TABLE "collectagent20172018" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collectagent20172018" ON "collectagent20172018";
CREATE POLICY "Allow public read-write for collectagent20172018" ON "collectagent20172018" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collectagent20182019" (
  "Customer_id" BIGINT,
  "Collect_id" BIGINT
);
ALTER TABLE "collectagent20182019" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collectagent20182019" ON "collectagent20182019";
CREATE POLICY "Allow public read-write for collectagent20182019" ON "collectagent20182019" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collectagent20192020" (
  "Customer_id" BIGINT,
  "Collect_id" BIGINT
);
ALTER TABLE "collectagent20192020" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collectagent20192020" ON "collectagent20192020";
CREATE POLICY "Allow public read-write for collectagent20192020" ON "collectagent20192020" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collectagent20202021" (
  "Customer_id" BIGINT,
  "Collect_id" BIGINT
);
ALTER TABLE "collectagent20202021" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collectagent20202021" ON "collectagent20202021";
CREATE POLICY "Allow public read-write for collectagent20202021" ON "collectagent20202021" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collectagent20212022" (
  "Customer_id" BIGINT,
  "Collect_id" BIGINT
);
ALTER TABLE "collectagent20212022" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collectagent20212022" ON "collectagent20212022";
CREATE POLICY "Allow public read-write for collectagent20212022" ON "collectagent20212022" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collectagent20222023" (
  "Customer_id" BIGINT,
  "Collect_id" BIGINT
);
ALTER TABLE "collectagent20222023" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collectagent20222023" ON "collectagent20222023";
CREATE POLICY "Allow public read-write for collectagent20222023" ON "collectagent20222023" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collectagent20232024" (
  "Customer_id" BIGINT,
  "Collect_id" BIGINT
);
ALTER TABLE "collectagent20232024" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collectagent20232024" ON "collectagent20232024";
CREATE POLICY "Allow public read-write for collectagent20232024" ON "collectagent20232024" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collectagent20242025" (
  "Customer_id" BIGINT,
  "Collect_id" BIGINT
);
ALTER TABLE "collectagent20242025" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collectagent20242025" ON "collectagent20242025";
CREATE POLICY "Allow public read-write for collectagent20242025" ON "collectagent20242025" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "collectagent20252026" (
  "Customer_id" BIGINT,
  "Collect_id" BIGINT
);
ALTER TABLE "collectagent20252026" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for collectagent20252026" ON "collectagent20252026";
CREATE POLICY "Allow public read-write for collectagent20252026" ON "collectagent20252026" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "company" (
  "id" BIGINT,
  "name" TEXT,
  "address" TEXT,
  "city" TEXT,
  "pincode" TEXT,
  "phone" TEXT,
  "mobile" TEXT,
  "fax" TEXT,
  "email" TEXT
);
ALTER TABLE "company" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for company" ON "company";
CREATE POLICY "Allow public read-write for company" ON "company" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "countersale" (
  "Publica_id" BIGINT,
  "Qty" BIGINT,
  "Amt" NUMERIC,
  "Sale_Date" TEXT
);
ALTER TABLE "countersale" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for countersale" ON "countersale";
CREATE POLICY "Allow public read-write for countersale" ON "countersale" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "customer" (
  "Customer_id" BIGINT,
  "name_eng" TEXT,
  "Type_Cust" BIGINT,
  "name_hindi" TEXT,
  "add1" TEXT,
  "add2" TEXT,
  "phone" TEXT,
  "Security_Deposit" BIGINT,
  "Type" TEXT,
  "Priority" BIGINT,
  "Self_Agent" BIGINT,
  "FontType" BIGINT,
  "dueamount" NUMERIC,
  "Region_id" BIGINT,
  "Paid" TEXT,
  "Delivery" BIGINT,
  "Discount" BIGINT,
  "GovtSupply" BIGINT,
  "Hindi_Add" TEXT,
  "Cbal" NUMERIC,
  "pmonth" TEXT,
  "pyear" TEXT
);
ALTER TABLE "customer" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for customer" ON "customer";
CREATE POLICY "Allow public read-write for customer" ON "customer" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "customer_detail" (
  "sno" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Qty" BIGINT,
  "Circulation" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "From_Day" TEXT,
  "Hawk_Sub" BIGINT,
  "Dis" TEXT,
  "Dely" BIGINT
);
ALTER TABLE "customer_detail" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for customer_detail" ON "customer_detail";
CREATE POLICY "Allow public read-write for customer_detail" ON "customer_detail" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "customer_detailback" (
  "sno" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Qty" BIGINT,
  "Circulation" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "From_Day" TEXT,
  "Hawk_Sub" BIGINT,
  "Dated" TEXT,
  "PostedTime" TEXT,
  "Dis" TEXT,
  "Dely" BIGINT
);
ALTER TABLE "customer_detailback" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for customer_detailback" ON "customer_detailback";
CREATE POLICY "Allow public read-write for customer_detailback" ON "customer_detailback" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "dailyprocess20072008" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Qty" BIGINT,
  "dated" TEXT,
  "Circulation" TEXT,
  "TypeP" TEXT,
  "Name" TEXT
);
ALTER TABLE "dailyprocess20072008" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for dailyprocess20072008" ON "dailyprocess20072008";
CREATE POLICY "Allow public read-write for dailyprocess20072008" ON "dailyprocess20072008" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "dailyprocess20082009" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT,
  "Circulation" TEXT,
  "TypeP" TEXT
);
ALTER TABLE "dailyprocess20082009" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for dailyprocess20082009" ON "dailyprocess20082009";
CREATE POLICY "Allow public read-write for dailyprocess20082009" ON "dailyprocess20082009" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "dailyprocess20092010" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT,
  "Circulation" TEXT,
  "TypeP" TEXT
);
ALTER TABLE "dailyprocess20092010" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for dailyprocess20092010" ON "dailyprocess20092010";
CREATE POLICY "Allow public read-write for dailyprocess20092010" ON "dailyprocess20092010" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "dailyprocess20102011" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT,
  "Circulation" TEXT,
  "TypeP" TEXT
);
ALTER TABLE "dailyprocess20102011" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for dailyprocess20102011" ON "dailyprocess20102011";
CREATE POLICY "Allow public read-write for dailyprocess20102011" ON "dailyprocess20102011" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "dailyprocess20112012" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT,
  "Circulation" TEXT,
  "TypeP" TEXT
);
ALTER TABLE "dailyprocess20112012" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for dailyprocess20112012" ON "dailyprocess20112012";
CREATE POLICY "Allow public read-write for dailyprocess20112012" ON "dailyprocess20112012" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "dailyprocess20122013" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT,
  "Circulation" TEXT,
  "TypeP" TEXT
);
ALTER TABLE "dailyprocess20122013" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for dailyprocess20122013" ON "dailyprocess20122013";
CREATE POLICY "Allow public read-write for dailyprocess20122013" ON "dailyprocess20122013" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "dailyprocess20132014" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT,
  "Circulation" TEXT,
  "TypeP" TEXT
);
ALTER TABLE "dailyprocess20132014" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for dailyprocess20132014" ON "dailyprocess20132014";
CREATE POLICY "Allow public read-write for dailyprocess20132014" ON "dailyprocess20132014" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "dailyprocess20142015" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT,
  "Circulation" TEXT,
  "TypeP" TEXT
);
ALTER TABLE "dailyprocess20142015" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for dailyprocess20142015" ON "dailyprocess20142015";
CREATE POLICY "Allow public read-write for dailyprocess20142015" ON "dailyprocess20142015" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "dailyprocess20152016" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT,
  "Circulation" TEXT,
  "TypeP" TEXT
);
ALTER TABLE "dailyprocess20152016" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for dailyprocess20152016" ON "dailyprocess20152016";
CREATE POLICY "Allow public read-write for dailyprocess20152016" ON "dailyprocess20152016" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "dailyprocess20162017" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT,
  "Circulation" TEXT,
  "TypeP" TEXT
);
ALTER TABLE "dailyprocess20162017" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for dailyprocess20162017" ON "dailyprocess20162017";
CREATE POLICY "Allow public read-write for dailyprocess20162017" ON "dailyprocess20162017" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "dailyprocess20172018" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT,
  "Circulation" TEXT,
  "TypeP" TEXT
);
ALTER TABLE "dailyprocess20172018" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for dailyprocess20172018" ON "dailyprocess20172018";
CREATE POLICY "Allow public read-write for dailyprocess20172018" ON "dailyprocess20172018" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "dailyprocess20182019" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT,
  "Circulation" TEXT,
  "TypeP" TEXT
);
ALTER TABLE "dailyprocess20182019" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for dailyprocess20182019" ON "dailyprocess20182019";
CREATE POLICY "Allow public read-write for dailyprocess20182019" ON "dailyprocess20182019" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "dailyprocess20192020" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT,
  "Circulation" TEXT,
  "TypeP" TEXT
);
ALTER TABLE "dailyprocess20192020" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for dailyprocess20192020" ON "dailyprocess20192020";
CREATE POLICY "Allow public read-write for dailyprocess20192020" ON "dailyprocess20192020" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "dailyprocess20202021" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT,
  "Circulation" TEXT,
  "TypeP" TEXT
);
ALTER TABLE "dailyprocess20202021" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for dailyprocess20202021" ON "dailyprocess20202021";
CREATE POLICY "Allow public read-write for dailyprocess20202021" ON "dailyprocess20202021" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "dailyprocess20212022" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT,
  "Circulation" TEXT,
  "TypeP" TEXT
);
ALTER TABLE "dailyprocess20212022" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for dailyprocess20212022" ON "dailyprocess20212022";
CREATE POLICY "Allow public read-write for dailyprocess20212022" ON "dailyprocess20212022" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "dailyprocess20222023" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT,
  "Circulation" TEXT,
  "TypeP" TEXT
);
ALTER TABLE "dailyprocess20222023" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for dailyprocess20222023" ON "dailyprocess20222023";
CREATE POLICY "Allow public read-write for dailyprocess20222023" ON "dailyprocess20222023" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "dailyprocess20232024" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT,
  "Circulation" TEXT,
  "TypeP" TEXT
);
ALTER TABLE "dailyprocess20232024" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for dailyprocess20232024" ON "dailyprocess20232024";
CREATE POLICY "Allow public read-write for dailyprocess20232024" ON "dailyprocess20232024" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "dailyprocess20242025" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT,
  "Circulation" TEXT,
  "TypeP" TEXT
);
ALTER TABLE "dailyprocess20242025" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for dailyprocess20242025" ON "dailyprocess20242025";
CREATE POLICY "Allow public read-write for dailyprocess20242025" ON "dailyprocess20242025" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "dailyprocess20252026" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT,
  "Circulation" TEXT,
  "TypeP" TEXT
);
ALTER TABLE "dailyprocess20252026" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for dailyprocess20252026" ON "dailyprocess20252026";
CREATE POLICY "Allow public read-write for dailyprocess20252026" ON "dailyprocess20252026" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "discontinue20072008" (
  "Discontinue_id" BIGINT,
  "SNo" BIGINT,
  "EntryDate" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Temp_Perma" TEXT,
  "Temp_From" TEXT,
  "Temp_To" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "Hawker_id" BIGINT
);
ALTER TABLE "discontinue20072008" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for discontinue20072008" ON "discontinue20072008";
CREATE POLICY "Allow public read-write for discontinue20072008" ON "discontinue20072008" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "discontinue20082009" (
  "Discontinue_id" BIGINT,
  "SNo" BIGINT,
  "EntryDate" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Temp_Perma" TEXT,
  "Temp_From" TEXT,
  "Temp_To" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "Hawker_id" BIGINT
);
ALTER TABLE "discontinue20082009" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for discontinue20082009" ON "discontinue20082009";
CREATE POLICY "Allow public read-write for discontinue20082009" ON "discontinue20082009" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "discontinue20092010" (
  "Discontinue_id" BIGINT,
  "SNo" BIGINT,
  "EntryDate" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Temp_Perma" TEXT,
  "Temp_From" TEXT,
  "Temp_To" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "Hawker_id" BIGINT
);
ALTER TABLE "discontinue20092010" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for discontinue20092010" ON "discontinue20092010";
CREATE POLICY "Allow public read-write for discontinue20092010" ON "discontinue20092010" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "discontinue20102011" (
  "Discontinue_id" BIGINT,
  "SNo" BIGINT,
  "EntryDate" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Temp_Perma" TEXT,
  "Temp_From" TEXT,
  "Temp_To" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "Hawker_id" BIGINT
);
ALTER TABLE "discontinue20102011" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for discontinue20102011" ON "discontinue20102011";
CREATE POLICY "Allow public read-write for discontinue20102011" ON "discontinue20102011" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "discontinue20112012" (
  "Discontinue_id" BIGINT,
  "SNo" BIGINT,
  "EntryDate" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Temp_Perma" TEXT,
  "Temp_From" TEXT,
  "Temp_To" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "Hawker_id" BIGINT
);
ALTER TABLE "discontinue20112012" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for discontinue20112012" ON "discontinue20112012";
CREATE POLICY "Allow public read-write for discontinue20112012" ON "discontinue20112012" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "discontinue20122013" (
  "Discontinue_id" BIGINT,
  "SNo" BIGINT,
  "EntryDate" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Temp_Perma" TEXT,
  "Temp_From" TEXT,
  "Temp_To" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "Hawker_id" BIGINT
);
ALTER TABLE "discontinue20122013" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for discontinue20122013" ON "discontinue20122013";
CREATE POLICY "Allow public read-write for discontinue20122013" ON "discontinue20122013" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "discontinue20132014" (
  "Discontinue_id" BIGINT,
  "SNo" BIGINT,
  "EntryDate" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Temp_Perma" TEXT,
  "Temp_From" TEXT,
  "Temp_To" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "Hawker_id" BIGINT
);
ALTER TABLE "discontinue20132014" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for discontinue20132014" ON "discontinue20132014";
CREATE POLICY "Allow public read-write for discontinue20132014" ON "discontinue20132014" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "discontinue20142015" (
  "Discontinue_id" BIGINT,
  "SNo" BIGINT,
  "EntryDate" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Temp_Perma" TEXT,
  "Temp_From" TEXT,
  "Temp_To" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "Hawker_id" BIGINT
);
ALTER TABLE "discontinue20142015" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for discontinue20142015" ON "discontinue20142015";
CREATE POLICY "Allow public read-write for discontinue20142015" ON "discontinue20142015" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "discontinue20152016" (
  "Discontinue_id" BIGINT,
  "SNo" BIGINT,
  "EntryDate" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Temp_Perma" TEXT,
  "Temp_From" TEXT,
  "Temp_To" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "Hawker_id" BIGINT
);
ALTER TABLE "discontinue20152016" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for discontinue20152016" ON "discontinue20152016";
CREATE POLICY "Allow public read-write for discontinue20152016" ON "discontinue20152016" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "discontinue20162017" (
  "Discontinue_id" BIGINT,
  "SNo" BIGINT,
  "EntryDate" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Temp_Perma" TEXT,
  "Temp_From" TEXT,
  "Temp_To" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "Hawker_id" BIGINT
);
ALTER TABLE "discontinue20162017" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for discontinue20162017" ON "discontinue20162017";
CREATE POLICY "Allow public read-write for discontinue20162017" ON "discontinue20162017" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "discontinue20172018" (
  "Discontinue_id" BIGINT,
  "SNo" BIGINT,
  "EntryDate" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Temp_Perma" TEXT,
  "Temp_From" TEXT,
  "Temp_To" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "Hawker_id" BIGINT
);
ALTER TABLE "discontinue20172018" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for discontinue20172018" ON "discontinue20172018";
CREATE POLICY "Allow public read-write for discontinue20172018" ON "discontinue20172018" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "discontinue20182019" (
  "Discontinue_id" BIGINT,
  "SNo" BIGINT,
  "EntryDate" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Temp_Perma" TEXT,
  "Temp_From" TEXT,
  "Temp_To" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "Hawker_id" BIGINT
);
ALTER TABLE "discontinue20182019" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for discontinue20182019" ON "discontinue20182019";
CREATE POLICY "Allow public read-write for discontinue20182019" ON "discontinue20182019" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "discontinue20192020" (
  "Discontinue_id" BIGINT,
  "SNo" BIGINT,
  "EntryDate" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Temp_Perma" TEXT,
  "Temp_From" TEXT,
  "Temp_To" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "Hawker_id" BIGINT
);
ALTER TABLE "discontinue20192020" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for discontinue20192020" ON "discontinue20192020";
CREATE POLICY "Allow public read-write for discontinue20192020" ON "discontinue20192020" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "discontinue20202021" (
  "Discontinue_id" BIGINT,
  "SNo" BIGINT,
  "EntryDate" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Temp_Perma" TEXT,
  "Temp_From" TEXT,
  "Temp_To" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "Hawker_id" BIGINT
);
ALTER TABLE "discontinue20202021" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for discontinue20202021" ON "discontinue20202021";
CREATE POLICY "Allow public read-write for discontinue20202021" ON "discontinue20202021" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "discontinue20212022" (
  "Discontinue_id" BIGINT,
  "SNo" BIGINT,
  "EntryDate" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Temp_Perma" TEXT,
  "Temp_From" TEXT,
  "Temp_To" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "Hawker_id" BIGINT
);
ALTER TABLE "discontinue20212022" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for discontinue20212022" ON "discontinue20212022";
CREATE POLICY "Allow public read-write for discontinue20212022" ON "discontinue20212022" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "discontinue20222023" (
  "Discontinue_id" BIGINT,
  "SNo" BIGINT,
  "EntryDate" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Temp_Perma" TEXT,
  "Temp_From" TEXT,
  "Temp_To" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "Hawker_id" BIGINT
);
ALTER TABLE "discontinue20222023" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for discontinue20222023" ON "discontinue20222023";
CREATE POLICY "Allow public read-write for discontinue20222023" ON "discontinue20222023" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "discontinue20232024" (
  "Discontinue_id" BIGINT,
  "SNo" BIGINT,
  "EntryDate" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Temp_Perma" TEXT,
  "Temp_From" TEXT,
  "Temp_To" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "Hawker_id" BIGINT
);
ALTER TABLE "discontinue20232024" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for discontinue20232024" ON "discontinue20232024";
CREATE POLICY "Allow public read-write for discontinue20232024" ON "discontinue20232024" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "discontinue20242025" (
  "Discontinue_id" BIGINT,
  "SNo" BIGINT,
  "EntryDate" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Temp_Perma" TEXT,
  "Temp_From" TEXT,
  "Temp_To" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "Hawker_id" BIGINT
);
ALTER TABLE "discontinue20242025" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for discontinue20242025" ON "discontinue20242025";
CREATE POLICY "Allow public read-write for discontinue20242025" ON "discontinue20242025" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "discontinue20252026" (
  "Discontinue_id" BIGINT,
  "SNo" BIGINT,
  "EntryDate" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Temp_Perma" TEXT,
  "Temp_From" TEXT,
  "Temp_To" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT,
  "Hawker_id" BIGINT
);
ALTER TABLE "discontinue20252026" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for discontinue20252026" ON "discontinue20252026";
CREATE POLICY "Allow public read-write for discontinue20252026" ON "discontinue20252026" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawker" (
  "Hawker_id" BIGINT,
  "name" TEXT,
  "address" TEXT,
  "city" TEXT,
  "phone" TEXT,
  "mobile" TEXT,
  "Region_id" BIGINT
);
ALTER TABLE "hawker" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawker" ON "hawker";
CREATE POLICY "Allow public read-write for hawker" ON "hawker" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawkerpriority20072008" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "hawkerpriority20072008" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawkerpriority20072008" ON "hawkerpriority20072008";
CREATE POLICY "Allow public read-write for hawkerpriority20072008" ON "hawkerpriority20072008" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawkerpriority20082009" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "hawkerpriority20082009" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawkerpriority20082009" ON "hawkerpriority20082009";
CREATE POLICY "Allow public read-write for hawkerpriority20082009" ON "hawkerpriority20082009" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawkerpriority20092010" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "hawkerpriority20092010" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawkerpriority20092010" ON "hawkerpriority20092010";
CREATE POLICY "Allow public read-write for hawkerpriority20092010" ON "hawkerpriority20092010" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawkerpriority20102011" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "hawkerpriority20102011" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawkerpriority20102011" ON "hawkerpriority20102011";
CREATE POLICY "Allow public read-write for hawkerpriority20102011" ON "hawkerpriority20102011" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawkerpriority20112012" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "hawkerpriority20112012" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawkerpriority20112012" ON "hawkerpriority20112012";
CREATE POLICY "Allow public read-write for hawkerpriority20112012" ON "hawkerpriority20112012" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawkerpriority20122013" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "hawkerpriority20122013" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawkerpriority20122013" ON "hawkerpriority20122013";
CREATE POLICY "Allow public read-write for hawkerpriority20122013" ON "hawkerpriority20122013" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawkerpriority20132014" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "hawkerpriority20132014" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawkerpriority20132014" ON "hawkerpriority20132014";
CREATE POLICY "Allow public read-write for hawkerpriority20132014" ON "hawkerpriority20132014" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawkerpriority20142015" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "hawkerpriority20142015" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawkerpriority20142015" ON "hawkerpriority20142015";
CREATE POLICY "Allow public read-write for hawkerpriority20142015" ON "hawkerpriority20142015" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawkerpriority20152016" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "hawkerpriority20152016" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawkerpriority20152016" ON "hawkerpriority20152016";
CREATE POLICY "Allow public read-write for hawkerpriority20152016" ON "hawkerpriority20152016" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawkerpriority20162017" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "hawkerpriority20162017" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawkerpriority20162017" ON "hawkerpriority20162017";
CREATE POLICY "Allow public read-write for hawkerpriority20162017" ON "hawkerpriority20162017" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawkerpriority20172018" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "hawkerpriority20172018" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawkerpriority20172018" ON "hawkerpriority20172018";
CREATE POLICY "Allow public read-write for hawkerpriority20172018" ON "hawkerpriority20172018" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawkerpriority20182019" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "hawkerpriority20182019" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawkerpriority20182019" ON "hawkerpriority20182019";
CREATE POLICY "Allow public read-write for hawkerpriority20182019" ON "hawkerpriority20182019" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawkerpriority20192020" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "hawkerpriority20192020" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawkerpriority20192020" ON "hawkerpriority20192020";
CREATE POLICY "Allow public read-write for hawkerpriority20192020" ON "hawkerpriority20192020" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawkerpriority20202021" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "hawkerpriority20202021" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawkerpriority20202021" ON "hawkerpriority20202021";
CREATE POLICY "Allow public read-write for hawkerpriority20202021" ON "hawkerpriority20202021" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawkerpriority20212022" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "hawkerpriority20212022" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawkerpriority20212022" ON "hawkerpriority20212022";
CREATE POLICY "Allow public read-write for hawkerpriority20212022" ON "hawkerpriority20212022" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawkerpriority20222023" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "hawkerpriority20222023" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawkerpriority20222023" ON "hawkerpriority20222023";
CREATE POLICY "Allow public read-write for hawkerpriority20222023" ON "hawkerpriority20222023" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawkerpriority20232024" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "hawkerpriority20232024" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawkerpriority20232024" ON "hawkerpriority20232024";
CREATE POLICY "Allow public read-write for hawkerpriority20232024" ON "hawkerpriority20232024" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawkerpriority20242025" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "hawkerpriority20242025" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawkerpriority20242025" ON "hawkerpriority20242025";
CREATE POLICY "Allow public read-write for hawkerpriority20242025" ON "hawkerpriority20242025" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "hawkerpriority20252026" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "hawkerpriority20252026" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for hawkerpriority20252026" ON "hawkerpriority20252026";
CREATE POLICY "Allow public read-write for hawkerpriority20252026" ON "hawkerpriority20252026" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "holiday" (
  "Oc_Date" TEXT,
  "Occasion" TEXT,
  "Publica_id" BIGINT
);
ALTER TABLE "holiday" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for holiday" ON "holiday";
CREATE POLICY "Allow public read-write for holiday" ON "holiday" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "login" (
  "user" TEXT,
  "pwd" TEXT,
  "Access" TEXT,
  "TF0" BIGINT,
  "TF1" BIGINT,
  "TF2" BIGINT,
  "TF3" BIGINT,
  "TF4" BIGINT,
  "TF5" BIGINT,
  "TF6" BIGINT,
  "TF7" BIGINT,
  "TF8" BIGINT,
  "TF9" BIGINT,
  "TF10" BIGINT,
  "TF11" BIGINT,
  "TF12" BIGINT,
  "TF13" BIGINT,
  "TF14" BIGINT,
  "TF15" BIGINT,
  "TF16" BIGINT,
  "TF17" BIGINT,
  "TF18" BIGINT,
  "TF19" BIGINT,
  "TF20" BIGINT,
  "TF21" BIGINT,
  "TF22" BIGINT,
  "TF23" BIGINT
);
ALTER TABLE "login" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for login" ON "login";
CREATE POLICY "Allow public read-write for login" ON "login" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "message" (
  "Message_id" BIGINT,
  "Dated" TEXT,
  "Message" TEXT
);
ALTER TABLE "message" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for message" ON "message";
CREATE POLICY "Allow public read-write for message" ON "message" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publication" (
  "Publica_id" BIGINT,
  "Public_name" TEXT,
  "TypeP" TEXT,
  "Publish_id" BIGINT,
  "Abrv" TEXT,
  "Circulation" TEXT,
  "Duration" TEXT,
  "MagzineDay" TEXT,
  "MagzineMonth" TEXT,
  "ChrDel" BIGINT,
  "Pub_Hindi" TEXT
);
ALTER TABLE "publication" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publication" ON "publication";
CREATE POLICY "Allow public read-write for publication" ON "publication" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationdis" (
  "Publica_id" BIGINT,
  "FromDate" TEXT,
  "ToDate" TEXT
);
ALTER TABLE "publicationdis" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationdis" ON "publicationdis";
CREATE POLICY "Allow public read-write for publicationdis" ON "publicationdis" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationprocess20072008" (
  "pub_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT
);
ALTER TABLE "publicationprocess20072008" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationprocess20072008" ON "publicationprocess20072008";
CREATE POLICY "Allow public read-write for publicationprocess20072008" ON "publicationprocess20072008" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationprocess20082009" (
  "pub_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT
);
ALTER TABLE "publicationprocess20082009" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationprocess20082009" ON "publicationprocess20082009";
CREATE POLICY "Allow public read-write for publicationprocess20082009" ON "publicationprocess20082009" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationprocess20092010" (
  "pub_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT
);
ALTER TABLE "publicationprocess20092010" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationprocess20092010" ON "publicationprocess20092010";
CREATE POLICY "Allow public read-write for publicationprocess20092010" ON "publicationprocess20092010" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationprocess20102011" (
  "pub_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT,
  "sno" BIGINT
);
ALTER TABLE "publicationprocess20102011" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationprocess20102011" ON "publicationprocess20102011";
CREATE POLICY "Allow public read-write for publicationprocess20102011" ON "publicationprocess20102011" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationprocess20112012" (
  "pub_id" BIGINT,
  "sno" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT
);
ALTER TABLE "publicationprocess20112012" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationprocess20112012" ON "publicationprocess20112012";
CREATE POLICY "Allow public read-write for publicationprocess20112012" ON "publicationprocess20112012" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationprocess20122013" (
  "pub_id" BIGINT,
  "sno" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT
);
ALTER TABLE "publicationprocess20122013" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationprocess20122013" ON "publicationprocess20122013";
CREATE POLICY "Allow public read-write for publicationprocess20122013" ON "publicationprocess20122013" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationprocess20132014" (
  "pub_id" BIGINT,
  "sno" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT
);
ALTER TABLE "publicationprocess20132014" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationprocess20132014" ON "publicationprocess20132014";
CREATE POLICY "Allow public read-write for publicationprocess20132014" ON "publicationprocess20132014" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationprocess20142015" (
  "pub_id" BIGINT,
  "sno" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT
);
ALTER TABLE "publicationprocess20142015" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationprocess20142015" ON "publicationprocess20142015";
CREATE POLICY "Allow public read-write for publicationprocess20142015" ON "publicationprocess20142015" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationprocess20152016" (
  "pub_id" BIGINT,
  "sno" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT
);
ALTER TABLE "publicationprocess20152016" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationprocess20152016" ON "publicationprocess20152016";
CREATE POLICY "Allow public read-write for publicationprocess20152016" ON "publicationprocess20152016" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationprocess20162017" (
  "pub_id" BIGINT,
  "sno" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT
);
ALTER TABLE "publicationprocess20162017" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationprocess20162017" ON "publicationprocess20162017";
CREATE POLICY "Allow public read-write for publicationprocess20162017" ON "publicationprocess20162017" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationprocess20172018" (
  "pub_id" BIGINT,
  "sno" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT
);
ALTER TABLE "publicationprocess20172018" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationprocess20172018" ON "publicationprocess20172018";
CREATE POLICY "Allow public read-write for publicationprocess20172018" ON "publicationprocess20172018" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationprocess20182019" (
  "pub_id" BIGINT,
  "sno" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT
);
ALTER TABLE "publicationprocess20182019" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationprocess20182019" ON "publicationprocess20182019";
CREATE POLICY "Allow public read-write for publicationprocess20182019" ON "publicationprocess20182019" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationprocess20192020" (
  "pub_id" BIGINT,
  "sno" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT
);
ALTER TABLE "publicationprocess20192020" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationprocess20192020" ON "publicationprocess20192020";
CREATE POLICY "Allow public read-write for publicationprocess20192020" ON "publicationprocess20192020" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationprocess20202021" (
  "pub_id" BIGINT,
  "sno" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT
);
ALTER TABLE "publicationprocess20202021" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationprocess20202021" ON "publicationprocess20202021";
CREATE POLICY "Allow public read-write for publicationprocess20202021" ON "publicationprocess20202021" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationprocess20212022" (
  "pub_id" BIGINT,
  "sno" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT
);
ALTER TABLE "publicationprocess20212022" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationprocess20212022" ON "publicationprocess20212022";
CREATE POLICY "Allow public read-write for publicationprocess20212022" ON "publicationprocess20212022" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationprocess20222023" (
  "pub_id" BIGINT,
  "sno" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT
);
ALTER TABLE "publicationprocess20222023" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationprocess20222023" ON "publicationprocess20222023";
CREATE POLICY "Allow public read-write for publicationprocess20222023" ON "publicationprocess20222023" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationprocess20232024" (
  "pub_id" BIGINT,
  "sno" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT
);
ALTER TABLE "publicationprocess20232024" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationprocess20232024" ON "publicationprocess20232024";
CREATE POLICY "Allow public read-write for publicationprocess20232024" ON "publicationprocess20232024" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationprocess20242025" (
  "pub_id" BIGINT,
  "sno" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT
);
ALTER TABLE "publicationprocess20242025" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationprocess20242025" ON "publicationprocess20242025";
CREATE POLICY "Allow public read-write for publicationprocess20242025" ON "publicationprocess20242025" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationprocess20252026" (
  "pub_id" BIGINT,
  "sno" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Name" TEXT,
  "Qty" BIGINT,
  "dated" TEXT
);
ALTER TABLE "publicationprocess20252026" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationprocess20252026" ON "publicationprocess20252026";
CREATE POLICY "Allow public read-write for publicationprocess20252026" ON "publicationprocess20252026" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publicationsup" (
  "Publica_id" BIGINT,
  "PublicaSup_id" BIGINT,
  "Month" TEXT,
  "Year" TEXT,
  "Region_id" BIGINT
);
ALTER TABLE "publicationsup" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publicationsup" ON "publicationsup";
CREATE POLICY "Allow public read-write for publicationsup" ON "publicationsup" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "publisher" (
  "Publish_id" BIGINT,
  "name" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "pincode" TEXT,
  "phone" TEXT,
  "mobile" TEXT,
  "fax" TEXT,
  "email" TEXT,
  "Website" TEXT,
  "Category" TEXT,
  "Type" TEXT
);
ALTER TABLE "publisher" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for publisher" ON "publisher";
CREATE POLICY "Allow public read-write for publisher" ON "publisher" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "purchase" (
  "Purchase_id" BIGINT,
  "Publish_id" BIGINT,
  "R_Date" TEXT,
  "Bill_No" TEXT,
  "Bill_Date" TEXT,
  "Total" NUMERIC,
  "Addless" NUMERIC,
  "NetAmt" NUMERIC
);
ALTER TABLE "purchase" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for purchase" ON "purchase";
CREATE POLICY "Allow public read-write for purchase" ON "purchase" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "purchasedetail" (
  "Purchase_id" BIGINT,
  "Bill_No" TEXT,
  "Publica_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC
);
ALTER TABLE "purchasedetail" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for purchasedetail" ON "purchasedetail";
CREATE POLICY "Allow public read-write for purchasedetail" ON "purchasedetail" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "rate" (
  "Publica_id" BIGINT,
  "Rate" NUMERIC,
  "Dayofweek" BIGINT
);
ALTER TABLE "rate" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for rate" ON "rate";
CREATE POLICY "Allow public read-write for rate" ON "rate" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "ratechange" (
  "Publica_id" BIGINT,
  "OldRate" NUMERIC,
  "NewRate" NUMERIC,
  "Dated" TEXT,
  "Dayofweek" BIGINT
);
ALTER TABLE "ratechange" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for ratechange" ON "ratechange";
CREATE POLICY "Allow public read-write for ratechange" ON "ratechange" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receipt20072008" (
  "Receipt_id" BIGINT,
  "Bill_id" BIGINT,
  "ReceiptNo" BIGINT,
  "ManualRepNo" BIGINT,
  "BillDate" TEXT,
  "BillAmt" NUMERIC,
  "MalRecpDt" TEXT,
  "Month" TEXT,
  "Year" TEXT,
  "DueAmt" NUMERIC,
  "MalRecpAmt" NUMERIC,
  "Balance" NUMERIC,
  "LessAmt" NUMERIC,
  "RAmt" NUMERIC,
  "ChequeNo" TEXT,
  "ChequeDate" TEXT,
  "Debit" NUMERIC,
  "Credit" NUMERIC,
  "Cash_Chq" TEXT,
  "Narr" TEXT,
  "customer_id" BIGINT
);
ALTER TABLE "receipt20072008" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receipt20072008" ON "receipt20072008";
CREATE POLICY "Allow public read-write for receipt20072008" ON "receipt20072008" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receipt20082009" (
  "Receipt_id" BIGINT,
  "Bill_id" BIGINT,
  "ReceiptNo" BIGINT,
  "ManualRepNo" BIGINT,
  "BillDate" TEXT,
  "BillAmt" NUMERIC,
  "MalRecpDt" TEXT,
  "Month" TEXT,
  "Year" TEXT,
  "DueAmt" NUMERIC,
  "MalRecpAmt" NUMERIC,
  "Balance" NUMERIC,
  "LessAmt" NUMERIC,
  "ChequeNo" TEXT,
  "ChequeDate" TEXT,
  "Debit" NUMERIC,
  "Credit" NUMERIC,
  "Cash_Chq" TEXT,
  "Narr" TEXT,
  "RAmt" NUMERIC
);
ALTER TABLE "receipt20082009" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receipt20082009" ON "receipt20082009";
CREATE POLICY "Allow public read-write for receipt20082009" ON "receipt20082009" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receipt20092010" (
  "Receipt_id" BIGINT,
  "Bill_id" BIGINT,
  "ReceiptNo" BIGINT,
  "ManualRepNo" BIGINT,
  "BillDate" TEXT,
  "BillAmt" NUMERIC,
  "MalRecpDt" TEXT,
  "Month" TEXT,
  "Year" TEXT,
  "DueAmt" NUMERIC,
  "MalRecpAmt" NUMERIC,
  "Balance" NUMERIC,
  "LessAmt" NUMERIC,
  "RAmt" NUMERIC,
  "ChequeNo" TEXT,
  "ChequeDate" TEXT,
  "Debit" NUMERIC,
  "Credit" NUMERIC,
  "Cash_Chq" TEXT,
  "Narr" TEXT,
  "customer_id" BIGINT
);
ALTER TABLE "receipt20092010" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receipt20092010" ON "receipt20092010";
CREATE POLICY "Allow public read-write for receipt20092010" ON "receipt20092010" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receipt20102011" (
  "Receipt_id" BIGINT,
  "Bill_id" BIGINT,
  "ReceiptNo" BIGINT,
  "ManualRepNo" BIGINT,
  "BillDate" TEXT,
  "BillAmt" NUMERIC,
  "MalRecpDt" TEXT,
  "Month" TEXT,
  "Year" TEXT,
  "DueAmt" NUMERIC,
  "MalRecpAmt" NUMERIC,
  "Balance" NUMERIC,
  "LessAmt" NUMERIC,
  "RAmt" NUMERIC,
  "ChequeNo" TEXT,
  "ChequeDate" TEXT,
  "Debit" NUMERIC,
  "Credit" NUMERIC,
  "Cash_Chq" TEXT,
  "Narr" TEXT,
  "customer_id" BIGINT
);
ALTER TABLE "receipt20102011" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receipt20102011" ON "receipt20102011";
CREATE POLICY "Allow public read-write for receipt20102011" ON "receipt20102011" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receipt20112012" (
  "Receipt_id" BIGINT,
  "Bill_id" BIGINT,
  "ReceiptNo" BIGINT,
  "ManualRepNo" BIGINT,
  "BillDate" TEXT,
  "BillAmt" NUMERIC,
  "MalRecpDt" TEXT,
  "Month" TEXT,
  "Year" TEXT,
  "DueAmt" NUMERIC,
  "MalRecpAmt" NUMERIC,
  "Balance" NUMERIC,
  "LessAmt" NUMERIC,
  "RAmt" NUMERIC,
  "ChequeNo" TEXT,
  "ChequeDate" TEXT,
  "Debit" NUMERIC,
  "Credit" NUMERIC,
  "Cash_Chq" TEXT,
  "Narr" TEXT,
  "customer_id" BIGINT
);
ALTER TABLE "receipt20112012" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receipt20112012" ON "receipt20112012";
CREATE POLICY "Allow public read-write for receipt20112012" ON "receipt20112012" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receipt20122013" (
  "Receipt_id" BIGINT,
  "Bill_id" BIGINT,
  "ReceiptNo" BIGINT,
  "ManualRepNo" BIGINT,
  "BillDate" TEXT,
  "BillAmt" NUMERIC,
  "MalRecpDt" TEXT,
  "Month" TEXT,
  "Year" TEXT,
  "DueAmt" NUMERIC,
  "MalRecpAmt" NUMERIC,
  "Balance" NUMERIC,
  "LessAmt" NUMERIC,
  "RAmt" NUMERIC,
  "ChequeNo" TEXT,
  "ChequeDate" TEXT,
  "Debit" NUMERIC,
  "Credit" NUMERIC,
  "Cash_Chq" TEXT,
  "Narr" TEXT,
  "customer_id" BIGINT
);
ALTER TABLE "receipt20122013" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receipt20122013" ON "receipt20122013";
CREATE POLICY "Allow public read-write for receipt20122013" ON "receipt20122013" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receipt20132014" (
  "Receipt_id" BIGINT,
  "Bill_id" BIGINT,
  "ReceiptNo" BIGINT,
  "ManualRepNo" BIGINT,
  "BillDate" TEXT,
  "BillAmt" NUMERIC,
  "MalRecpDt" TEXT,
  "Month" TEXT,
  "Year" TEXT,
  "DueAmt" NUMERIC,
  "MalRecpAmt" NUMERIC,
  "Balance" NUMERIC,
  "LessAmt" NUMERIC,
  "RAmt" NUMERIC,
  "ChequeNo" TEXT,
  "ChequeDate" TEXT,
  "Debit" NUMERIC,
  "Credit" NUMERIC,
  "Cash_Chq" TEXT,
  "Narr" TEXT,
  "customer_id" BIGINT
);
ALTER TABLE "receipt20132014" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receipt20132014" ON "receipt20132014";
CREATE POLICY "Allow public read-write for receipt20132014" ON "receipt20132014" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receipt20142015" (
  "Receipt_id" BIGINT,
  "Bill_id" BIGINT,
  "ReceiptNo" BIGINT,
  "ManualRepNo" BIGINT,
  "BillDate" TEXT,
  "BillAmt" NUMERIC,
  "MalRecpDt" TEXT,
  "Month" TEXT,
  "Year" TEXT,
  "DueAmt" NUMERIC,
  "MalRecpAmt" NUMERIC,
  "Balance" NUMERIC,
  "LessAmt" NUMERIC,
  "RAmt" NUMERIC,
  "ChequeNo" TEXT,
  "ChequeDate" TEXT,
  "Debit" NUMERIC,
  "Credit" NUMERIC,
  "Cash_Chq" TEXT,
  "Narr" TEXT,
  "customer_id" BIGINT
);
ALTER TABLE "receipt20142015" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receipt20142015" ON "receipt20142015";
CREATE POLICY "Allow public read-write for receipt20142015" ON "receipt20142015" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receipt20152016" (
  "Receipt_id" BIGINT,
  "Bill_id" BIGINT,
  "ReceiptNo" BIGINT,
  "ManualRepNo" BIGINT,
  "BillDate" TEXT,
  "BillAmt" NUMERIC,
  "MalRecpDt" TEXT,
  "Month" TEXT,
  "Year" TEXT,
  "DueAmt" NUMERIC,
  "MalRecpAmt" NUMERIC,
  "Balance" NUMERIC,
  "LessAmt" NUMERIC,
  "RAmt" NUMERIC,
  "ChequeNo" TEXT,
  "ChequeDate" TEXT,
  "Debit" NUMERIC,
  "Credit" NUMERIC,
  "Cash_Chq" TEXT,
  "Narr" TEXT,
  "customer_id" BIGINT
);
ALTER TABLE "receipt20152016" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receipt20152016" ON "receipt20152016";
CREATE POLICY "Allow public read-write for receipt20152016" ON "receipt20152016" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receipt20162017" (
  "Receipt_id" BIGINT,
  "Bill_id" BIGINT,
  "ReceiptNo" BIGINT,
  "ManualRepNo" BIGINT,
  "BillDate" TEXT,
  "BillAmt" NUMERIC,
  "MalRecpDt" TEXT,
  "Month" TEXT,
  "Year" TEXT,
  "DueAmt" NUMERIC,
  "MalRecpAmt" NUMERIC,
  "Balance" NUMERIC,
  "LessAmt" NUMERIC,
  "RAmt" NUMERIC,
  "ChequeNo" TEXT,
  "ChequeDate" TEXT,
  "Debit" NUMERIC,
  "Credit" NUMERIC,
  "Cash_Chq" TEXT,
  "Narr" TEXT,
  "customer_id" BIGINT
);
ALTER TABLE "receipt20162017" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receipt20162017" ON "receipt20162017";
CREATE POLICY "Allow public read-write for receipt20162017" ON "receipt20162017" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receipt20172018" (
  "Receipt_id" BIGINT,
  "Bill_id" BIGINT,
  "ReceiptNo" BIGINT,
  "ManualRepNo" BIGINT,
  "BillDate" TEXT,
  "BillAmt" NUMERIC,
  "MalRecpDt" TEXT,
  "Month" TEXT,
  "Year" TEXT,
  "DueAmt" NUMERIC,
  "MalRecpAmt" NUMERIC,
  "Balance" NUMERIC,
  "LessAmt" NUMERIC,
  "RAmt" NUMERIC,
  "ChequeNo" TEXT,
  "ChequeDate" TEXT,
  "Debit" NUMERIC,
  "Credit" NUMERIC,
  "Cash_Chq" TEXT,
  "Narr" TEXT,
  "customer_id" BIGINT
);
ALTER TABLE "receipt20172018" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receipt20172018" ON "receipt20172018";
CREATE POLICY "Allow public read-write for receipt20172018" ON "receipt20172018" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receipt20182019" (
  "Receipt_id" BIGINT,
  "Bill_id" BIGINT,
  "ReceiptNo" BIGINT,
  "ManualRepNo" BIGINT,
  "BillDate" TEXT,
  "BillAmt" NUMERIC,
  "MalRecpDt" TEXT,
  "Month" TEXT,
  "Year" TEXT,
  "DueAmt" NUMERIC,
  "MalRecpAmt" NUMERIC,
  "Balance" NUMERIC,
  "LessAmt" NUMERIC,
  "RAmt" NUMERIC,
  "ChequeNo" TEXT,
  "ChequeDate" TEXT,
  "Debit" NUMERIC,
  "Credit" NUMERIC,
  "Cash_Chq" TEXT,
  "Narr" TEXT,
  "customer_id" BIGINT
);
ALTER TABLE "receipt20182019" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receipt20182019" ON "receipt20182019";
CREATE POLICY "Allow public read-write for receipt20182019" ON "receipt20182019" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receipt20192020" (
  "Receipt_id" BIGINT,
  "Bill_id" BIGINT,
  "ReceiptNo" BIGINT,
  "ManualRepNo" BIGINT,
  "BillDate" TEXT,
  "BillAmt" NUMERIC,
  "MalRecpDt" TEXT,
  "Month" TEXT,
  "Year" TEXT,
  "DueAmt" NUMERIC,
  "MalRecpAmt" NUMERIC,
  "Balance" NUMERIC,
  "LessAmt" NUMERIC,
  "RAmt" NUMERIC,
  "ChequeNo" TEXT,
  "ChequeDate" TEXT,
  "Debit" NUMERIC,
  "Credit" NUMERIC,
  "Cash_Chq" TEXT,
  "Narr" TEXT,
  "customer_id" BIGINT
);
ALTER TABLE "receipt20192020" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receipt20192020" ON "receipt20192020";
CREATE POLICY "Allow public read-write for receipt20192020" ON "receipt20192020" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receipt20202021" (
  "Receipt_id" BIGINT,
  "Bill_id" BIGINT,
  "ReceiptNo" BIGINT,
  "ManualRepNo" BIGINT,
  "BillDate" TEXT,
  "BillAmt" NUMERIC,
  "MalRecpDt" TEXT,
  "Month" TEXT,
  "Year" TEXT,
  "DueAmt" NUMERIC,
  "MalRecpAmt" NUMERIC,
  "Balance" NUMERIC,
  "LessAmt" NUMERIC,
  "RAmt" NUMERIC,
  "ChequeNo" TEXT,
  "ChequeDate" TEXT,
  "Debit" NUMERIC,
  "Credit" NUMERIC,
  "Cash_Chq" TEXT,
  "Narr" TEXT,
  "customer_id" BIGINT
);
ALTER TABLE "receipt20202021" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receipt20202021" ON "receipt20202021";
CREATE POLICY "Allow public read-write for receipt20202021" ON "receipt20202021" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receipt20212022" (
  "Receipt_id" BIGINT,
  "Bill_id" BIGINT,
  "ReceiptNo" BIGINT,
  "ManualRepNo" BIGINT,
  "BillDate" TEXT,
  "BillAmt" NUMERIC,
  "MalRecpDt" TEXT,
  "Month" TEXT,
  "Year" TEXT,
  "DueAmt" NUMERIC,
  "MalRecpAmt" NUMERIC,
  "Balance" NUMERIC,
  "LessAmt" NUMERIC,
  "RAmt" NUMERIC,
  "ChequeNo" TEXT,
  "ChequeDate" TEXT,
  "Debit" NUMERIC,
  "Credit" NUMERIC,
  "Cash_Chq" TEXT,
  "Narr" TEXT,
  "customer_id" BIGINT
);
ALTER TABLE "receipt20212022" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receipt20212022" ON "receipt20212022";
CREATE POLICY "Allow public read-write for receipt20212022" ON "receipt20212022" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receipt20222023" (
  "Receipt_id" BIGINT,
  "Bill_id" BIGINT,
  "ReceiptNo" BIGINT,
  "ManualRepNo" BIGINT,
  "BillDate" TEXT,
  "BillAmt" NUMERIC,
  "MalRecpDt" TEXT,
  "Month" TEXT,
  "Year" TEXT,
  "DueAmt" NUMERIC,
  "MalRecpAmt" NUMERIC,
  "Balance" NUMERIC,
  "LessAmt" NUMERIC,
  "RAmt" NUMERIC,
  "ChequeNo" TEXT,
  "ChequeDate" TEXT,
  "Debit" NUMERIC,
  "Credit" NUMERIC,
  "Cash_Chq" TEXT,
  "Narr" TEXT,
  "customer_id" BIGINT
);
ALTER TABLE "receipt20222023" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receipt20222023" ON "receipt20222023";
CREATE POLICY "Allow public read-write for receipt20222023" ON "receipt20222023" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receipt20232024" (
  "Receipt_id" BIGINT,
  "Bill_id" BIGINT,
  "ReceiptNo" BIGINT,
  "ManualRepNo" BIGINT,
  "BillDate" TEXT,
  "BillAmt" NUMERIC,
  "MalRecpDt" TEXT,
  "Month" TEXT,
  "Year" TEXT,
  "DueAmt" NUMERIC,
  "MalRecpAmt" NUMERIC,
  "Balance" NUMERIC,
  "LessAmt" NUMERIC,
  "RAmt" NUMERIC,
  "ChequeNo" TEXT,
  "ChequeDate" TEXT,
  "Debit" NUMERIC,
  "Credit" NUMERIC,
  "Cash_Chq" TEXT,
  "Narr" TEXT,
  "customer_id" BIGINT
);
ALTER TABLE "receipt20232024" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receipt20232024" ON "receipt20232024";
CREATE POLICY "Allow public read-write for receipt20232024" ON "receipt20232024" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receipt20242025" (
  "Receipt_id" BIGINT,
  "Bill_id" BIGINT,
  "ReceiptNo" BIGINT,
  "ManualRepNo" BIGINT,
  "BillDate" TEXT,
  "BillAmt" NUMERIC,
  "MalRecpDt" TEXT,
  "Month" TEXT,
  "Year" TEXT,
  "DueAmt" NUMERIC,
  "MalRecpAmt" NUMERIC,
  "Balance" NUMERIC,
  "LessAmt" NUMERIC,
  "RAmt" NUMERIC,
  "ChequeNo" TEXT,
  "ChequeDate" TEXT,
  "Debit" NUMERIC,
  "Credit" NUMERIC,
  "Cash_Chq" TEXT,
  "Narr" TEXT,
  "customer_id" BIGINT
);
ALTER TABLE "receipt20242025" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receipt20242025" ON "receipt20242025";
CREATE POLICY "Allow public read-write for receipt20242025" ON "receipt20242025" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receipt20252026" (
  "Receipt_id" BIGINT,
  "Bill_id" BIGINT,
  "ReceiptNo" BIGINT,
  "ManualRepNo" BIGINT,
  "BillDate" TEXT,
  "BillAmt" NUMERIC,
  "MalRecpDt" TEXT,
  "Month" TEXT,
  "Year" TEXT,
  "DueAmt" NUMERIC,
  "MalRecpAmt" NUMERIC,
  "Balance" NUMERIC,
  "LessAmt" NUMERIC,
  "RAmt" NUMERIC,
  "ChequeNo" TEXT,
  "ChequeDate" TEXT,
  "Debit" NUMERIC,
  "Credit" NUMERIC,
  "Cash_Chq" TEXT,
  "Narr" TEXT,
  "customer_id" BIGINT
);
ALTER TABLE "receipt20252026" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receipt20252026" ON "receipt20252026";
CREATE POLICY "Allow public read-write for receipt20252026" ON "receipt20252026" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receiptissue20072008" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);
ALTER TABLE "receiptissue20072008" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receiptissue20072008" ON "receiptissue20072008";
CREATE POLICY "Allow public read-write for receiptissue20072008" ON "receiptissue20072008" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receiptissue20082009" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);
ALTER TABLE "receiptissue20082009" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receiptissue20082009" ON "receiptissue20082009";
CREATE POLICY "Allow public read-write for receiptissue20082009" ON "receiptissue20082009" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receiptissue20092010" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);
ALTER TABLE "receiptissue20092010" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receiptissue20092010" ON "receiptissue20092010";
CREATE POLICY "Allow public read-write for receiptissue20092010" ON "receiptissue20092010" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receiptissue20102011" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);
ALTER TABLE "receiptissue20102011" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receiptissue20102011" ON "receiptissue20102011";
CREATE POLICY "Allow public read-write for receiptissue20102011" ON "receiptissue20102011" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receiptissue20112012" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);
ALTER TABLE "receiptissue20112012" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receiptissue20112012" ON "receiptissue20112012";
CREATE POLICY "Allow public read-write for receiptissue20112012" ON "receiptissue20112012" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receiptissue20122013" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);
ALTER TABLE "receiptissue20122013" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receiptissue20122013" ON "receiptissue20122013";
CREATE POLICY "Allow public read-write for receiptissue20122013" ON "receiptissue20122013" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receiptissue20132014" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);
ALTER TABLE "receiptissue20132014" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receiptissue20132014" ON "receiptissue20132014";
CREATE POLICY "Allow public read-write for receiptissue20132014" ON "receiptissue20132014" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receiptissue20142015" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);
ALTER TABLE "receiptissue20142015" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receiptissue20142015" ON "receiptissue20142015";
CREATE POLICY "Allow public read-write for receiptissue20142015" ON "receiptissue20142015" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receiptissue20152016" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);
ALTER TABLE "receiptissue20152016" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receiptissue20152016" ON "receiptissue20152016";
CREATE POLICY "Allow public read-write for receiptissue20152016" ON "receiptissue20152016" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receiptissue20162017" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);
ALTER TABLE "receiptissue20162017" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receiptissue20162017" ON "receiptissue20162017";
CREATE POLICY "Allow public read-write for receiptissue20162017" ON "receiptissue20162017" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receiptissue20172018" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);
ALTER TABLE "receiptissue20172018" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receiptissue20172018" ON "receiptissue20172018";
CREATE POLICY "Allow public read-write for receiptissue20172018" ON "receiptissue20172018" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receiptissue20182019" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);
ALTER TABLE "receiptissue20182019" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receiptissue20182019" ON "receiptissue20182019";
CREATE POLICY "Allow public read-write for receiptissue20182019" ON "receiptissue20182019" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receiptissue20192020" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);
ALTER TABLE "receiptissue20192020" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receiptissue20192020" ON "receiptissue20192020";
CREATE POLICY "Allow public read-write for receiptissue20192020" ON "receiptissue20192020" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receiptissue20202021" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);
ALTER TABLE "receiptissue20202021" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receiptissue20202021" ON "receiptissue20202021";
CREATE POLICY "Allow public read-write for receiptissue20202021" ON "receiptissue20202021" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receiptissue20212022" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);
ALTER TABLE "receiptissue20212022" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receiptissue20212022" ON "receiptissue20212022";
CREATE POLICY "Allow public read-write for receiptissue20212022" ON "receiptissue20212022" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receiptissue20222023" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);
ALTER TABLE "receiptissue20222023" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receiptissue20222023" ON "receiptissue20222023";
CREATE POLICY "Allow public read-write for receiptissue20222023" ON "receiptissue20222023" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receiptissue20232024" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);
ALTER TABLE "receiptissue20232024" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receiptissue20232024" ON "receiptissue20232024";
CREATE POLICY "Allow public read-write for receiptissue20232024" ON "receiptissue20232024" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receiptissue20242025" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);
ALTER TABLE "receiptissue20242025" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receiptissue20242025" ON "receiptissue20242025";
CREATE POLICY "Allow public read-write for receiptissue20242025" ON "receiptissue20242025" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "receiptissue20252026" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);
ALTER TABLE "receiptissue20252026" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for receiptissue20252026" ON "receiptissue20252026";
CREATE POLICY "Allow public read-write for receiptissue20252026" ON "receiptissue20252026" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "regiond" (
  "Region_id" BIGINT,
  "Region_name" TEXT
);
ALTER TABLE "regiond" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for regiond" ON "regiond";
CREATE POLICY "Allow public read-write for regiond" ON "regiond" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "retailsale20072008" (
  "Retail_id" BIGINT,
  "Vr_Date" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Copies" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC,
  "Narr" TEXT
);
ALTER TABLE "retailsale20072008" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for retailsale20072008" ON "retailsale20072008";
CREATE POLICY "Allow public read-write for retailsale20072008" ON "retailsale20072008" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "retailsale20082009" (
  "Retail_id" BIGINT,
  "Vr_Date" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Copies" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC,
  "Narr" TEXT
);
ALTER TABLE "retailsale20082009" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for retailsale20082009" ON "retailsale20082009";
CREATE POLICY "Allow public read-write for retailsale20082009" ON "retailsale20082009" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "retailsale20092010" (
  "Retail_id" BIGINT,
  "Vr_Date" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Copies" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC,
  "Narr" TEXT
);
ALTER TABLE "retailsale20092010" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for retailsale20092010" ON "retailsale20092010";
CREATE POLICY "Allow public read-write for retailsale20092010" ON "retailsale20092010" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "retailsale20102011" (
  "Retail_id" BIGINT,
  "Vr_Date" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Copies" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC,
  "Narr" TEXT
);
ALTER TABLE "retailsale20102011" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for retailsale20102011" ON "retailsale20102011";
CREATE POLICY "Allow public read-write for retailsale20102011" ON "retailsale20102011" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "retailsale20112012" (
  "Retail_id" BIGINT,
  "Vr_Date" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Copies" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC,
  "Narr" TEXT
);
ALTER TABLE "retailsale20112012" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for retailsale20112012" ON "retailsale20112012";
CREATE POLICY "Allow public read-write for retailsale20112012" ON "retailsale20112012" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "retailsale20122013" (
  "Retail_id" BIGINT,
  "Vr_Date" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Copies" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC,
  "Narr" TEXT
);
ALTER TABLE "retailsale20122013" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for retailsale20122013" ON "retailsale20122013";
CREATE POLICY "Allow public read-write for retailsale20122013" ON "retailsale20122013" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "retailsale20132014" (
  "Retail_id" BIGINT,
  "Vr_Date" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Copies" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC,
  "Narr" TEXT
);
ALTER TABLE "retailsale20132014" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for retailsale20132014" ON "retailsale20132014";
CREATE POLICY "Allow public read-write for retailsale20132014" ON "retailsale20132014" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "retailsale20142015" (
  "Retail_id" BIGINT,
  "Vr_Date" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Copies" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC,
  "Narr" TEXT
);
ALTER TABLE "retailsale20142015" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for retailsale20142015" ON "retailsale20142015";
CREATE POLICY "Allow public read-write for retailsale20142015" ON "retailsale20142015" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "retailsale20152016" (
  "Retail_id" BIGINT,
  "Vr_Date" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Copies" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC,
  "Narr" TEXT
);
ALTER TABLE "retailsale20152016" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for retailsale20152016" ON "retailsale20152016";
CREATE POLICY "Allow public read-write for retailsale20152016" ON "retailsale20152016" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "retailsale20162017" (
  "Retail_id" BIGINT,
  "Vr_Date" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Copies" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC,
  "Narr" TEXT
);
ALTER TABLE "retailsale20162017" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for retailsale20162017" ON "retailsale20162017";
CREATE POLICY "Allow public read-write for retailsale20162017" ON "retailsale20162017" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "retailsale20172018" (
  "Retail_id" BIGINT,
  "Vr_Date" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Copies" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC,
  "Narr" TEXT
);
ALTER TABLE "retailsale20172018" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for retailsale20172018" ON "retailsale20172018";
CREATE POLICY "Allow public read-write for retailsale20172018" ON "retailsale20172018" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "retailsale20182019" (
  "Retail_id" BIGINT,
  "Vr_Date" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Copies" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC,
  "Narr" TEXT
);
ALTER TABLE "retailsale20182019" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for retailsale20182019" ON "retailsale20182019";
CREATE POLICY "Allow public read-write for retailsale20182019" ON "retailsale20182019" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "retailsale20192020" (
  "Retail_id" BIGINT,
  "Vr_Date" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Copies" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC,
  "Narr" TEXT
);
ALTER TABLE "retailsale20192020" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for retailsale20192020" ON "retailsale20192020";
CREATE POLICY "Allow public read-write for retailsale20192020" ON "retailsale20192020" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "retailsale20202021" (
  "Retail_id" BIGINT,
  "Vr_Date" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Copies" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC,
  "Narr" TEXT
);
ALTER TABLE "retailsale20202021" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for retailsale20202021" ON "retailsale20202021";
CREATE POLICY "Allow public read-write for retailsale20202021" ON "retailsale20202021" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "retailsale20212022" (
  "Retail_id" BIGINT,
  "Vr_Date" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Copies" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC,
  "Narr" TEXT
);
ALTER TABLE "retailsale20212022" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for retailsale20212022" ON "retailsale20212022";
CREATE POLICY "Allow public read-write for retailsale20212022" ON "retailsale20212022" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "retailsale20222023" (
  "Retail_id" BIGINT,
  "Vr_Date" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Copies" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC,
  "Narr" TEXT
);
ALTER TABLE "retailsale20222023" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for retailsale20222023" ON "retailsale20222023";
CREATE POLICY "Allow public read-write for retailsale20222023" ON "retailsale20222023" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "retailsale20232024" (
  "Retail_id" BIGINT,
  "Vr_Date" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Copies" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC,
  "Narr" TEXT
);
ALTER TABLE "retailsale20232024" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for retailsale20232024" ON "retailsale20232024";
CREATE POLICY "Allow public read-write for retailsale20232024" ON "retailsale20232024" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "retailsale20242025" (
  "Retail_id" BIGINT,
  "Vr_Date" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Copies" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC,
  "Narr" TEXT
);
ALTER TABLE "retailsale20242025" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for retailsale20242025" ON "retailsale20242025";
CREATE POLICY "Allow public read-write for retailsale20242025" ON "retailsale20242025" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "retailsale20252026" (
  "Retail_id" BIGINT,
  "Vr_Date" TEXT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Copies" BIGINT,
  "Rate" NUMERIC,
  "Amt" NUMERIC,
  "Narr" TEXT
);
ALTER TABLE "retailsale20252026" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for retailsale20252026" ON "retailsale20252026";
CREATE POLICY "Allow public read-write for retailsale20252026" ON "retailsale20252026" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "temp_hawkerpriority20132014" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "temp_hawkerpriority20132014" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for temp_hawkerpriority20132014" ON "temp_hawkerpriority20132014";
CREATE POLICY "Allow public read-write for temp_hawkerpriority20132014" ON "temp_hawkerpriority20132014" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "temp_hawkerpriority20242025" (
  "Customer_id" BIGINT,
  "Hawker_id" BIGINT,
  "publica_id" BIGINT,
  "Priority" BIGINT,
  "qty" BIGINT
);
ALTER TABLE "temp_hawkerpriority20242025" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for temp_hawkerpriority20242025" ON "temp_hawkerpriority20242025";
CREATE POLICY "Allow public read-write for temp_hawkerpriority20242025" ON "temp_hawkerpriority20242025" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempbill" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "tempbill" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempbill" ON "tempbill";
CREATE POLICY "Allow public read-write for tempbill" ON "tempbill" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempbill20092010" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "tempbill20092010" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempbill20092010" ON "tempbill20092010";
CREATE POLICY "Allow public read-write for tempbill20092010" ON "tempbill20092010" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempbill20102011" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "tempbill20102011" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempbill20102011" ON "tempbill20102011";
CREATE POLICY "Allow public read-write for tempbill20102011" ON "tempbill20102011" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempbill20122013" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "tempbill20122013" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempbill20122013" ON "tempbill20122013";
CREATE POLICY "Allow public read-write for tempbill20122013" ON "tempbill20122013" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempbill20142015" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "tempbill20142015" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempbill20142015" ON "tempbill20142015";
CREATE POLICY "Allow public read-write for tempbill20142015" ON "tempbill20142015" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempbill20152016" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "tempbill20152016" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempbill20152016" ON "tempbill20152016";
CREATE POLICY "Allow public read-write for tempbill20152016" ON "tempbill20152016" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempbill20212022" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "tempbill20212022" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempbill20212022" ON "tempbill20212022";
CREATE POLICY "Allow public read-write for tempbill20212022" ON "tempbill20212022" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempbill20232024" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Publica_id" BIGINT,
  "Region_id" BIGINT,
  "Qty" BIGINT,
  "Rate" NUMERIC,
  "D_Charges" NUMERIC,
  "TotalAmt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "sno" BIGINT
);
ALTER TABLE "tempbill20232024" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempbill20232024" ON "tempbill20232024";
CREATE POLICY "Allow public read-write for tempbill20232024" ON "tempbill20232024" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempbillno" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "tempbillno" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempbillno" ON "tempbillno";
CREATE POLICY "Allow public read-write for tempbillno" ON "tempbillno" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempbillno20092010" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "tempbillno20092010" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempbillno20092010" ON "tempbillno20092010";
CREATE POLICY "Allow public read-write for tempbillno20092010" ON "tempbillno20092010" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempbillno20102011" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "tempbillno20102011" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempbillno20102011" ON "tempbillno20102011";
CREATE POLICY "Allow public read-write for tempbillno20102011" ON "tempbillno20102011" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempbillno20122013" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "tempbillno20122013" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempbillno20122013" ON "tempbillno20122013";
CREATE POLICY "Allow public read-write for tempbillno20122013" ON "tempbillno20122013" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempbillno20142015" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "tempbillno20142015" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempbillno20142015" ON "tempbillno20142015";
CREATE POLICY "Allow public read-write for tempbillno20142015" ON "tempbillno20142015" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempbillno20152016" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "tempbillno20152016" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempbillno20152016" ON "tempbillno20152016";
CREATE POLICY "Allow public read-write for tempbillno20152016" ON "tempbillno20152016" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempbillno20212022" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "tempbillno20212022" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempbillno20212022" ON "tempbillno20212022";
CREATE POLICY "Allow public read-write for tempbillno20212022" ON "tempbillno20212022" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempbillno20232024" (
  "Bill_id" BIGINT,
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Due_Amt" NUMERIC,
  "Del_Amt" NUMERIC,
  "Dis_Amt" NUMERIC,
  "Month" TEXT,
  "year" TEXT,
  "Balance" NUMERIC
);
ALTER TABLE "tempbillno20232024" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempbillno20232024" ON "tempbillno20232024";
CREATE POLICY "Allow public read-write for tempbillno20232024" ON "tempbillno20232024" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempstartingpublicprocess20112012" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Qty" BIGINT,
  "dated" TEXT,
  "From_Day" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT
);
ALTER TABLE "tempstartingpublicprocess20112012" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempstartingpublicprocess20112012" ON "tempstartingpublicprocess20112012";
CREATE POLICY "Allow public read-write for tempstartingpublicprocess20112012" ON "tempstartingpublicprocess20112012" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempstartingpublicprocess20122013" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Qty" BIGINT,
  "dated" TEXT,
  "From_Day" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT
);
ALTER TABLE "tempstartingpublicprocess20122013" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempstartingpublicprocess20122013" ON "tempstartingpublicprocess20122013";
CREATE POLICY "Allow public read-write for tempstartingpublicprocess20122013" ON "tempstartingpublicprocess20122013" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempstartingpublicprocess20162017" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Qty" BIGINT,
  "dated" TEXT,
  "From_Day" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT
);
ALTER TABLE "tempstartingpublicprocess20162017" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempstartingpublicprocess20162017" ON "tempstartingpublicprocess20162017";
CREATE POLICY "Allow public read-write for tempstartingpublicprocess20162017" ON "tempstartingpublicprocess20162017" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "tempstartingpublicprocess20172018" (
  "Customer_id" BIGINT,
  "Region_id" BIGINT,
  "Publica_id" BIGINT,
  "Hawker_id" BIGINT,
  "Qty" BIGINT,
  "dated" TEXT,
  "From_Day" TEXT,
  "S_Date" TEXT,
  "C_Date" TEXT
);
ALTER TABLE "tempstartingpublicprocess20172018" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for tempstartingpublicprocess20172018" ON "tempstartingpublicprocess20172018";
CREATE POLICY "Allow public read-write for tempstartingpublicprocess20172018" ON "tempstartingpublicprocess20172018" FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS "year" (
  "Year_id" BIGINT,
  "Start" BIGINT,
  "End" BIGINT
);
ALTER TABLE "year" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read-write for year" ON "year";
CREATE POLICY "Allow public read-write for year" ON "year" FOR ALL USING (true) WITH CHECK (true);

