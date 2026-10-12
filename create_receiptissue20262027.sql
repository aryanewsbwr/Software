-- Create receiptissue20262027 table for FY 2026-2027
CREATE TABLE IF NOT EXISTS "receiptissue20262027" (
  "sno" BIGINT,
  "Collect_id" BIGINT,
  "ReceiptFrom" TEXT,
  "ReceiptTo" TEXT,
  "IssueDate" TEXT,
  "RecDate" TEXT
);

ALTER TABLE "receiptissue20262027" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read-write for receiptissue20262027" ON "receiptissue20262027";
CREATE POLICY "Allow public read-write for receiptissue20262027" ON "receiptissue20262027" FOR ALL USING (true) WITH CHECK (true);
