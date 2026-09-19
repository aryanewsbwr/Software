const fs = require('fs');

const content = fs.readFileSync('supabase_core_tables.sql', 'utf-8');
const searchStr = 'INSERT INTO "publicationdis" ("Publica_id", "FromDate", "ToDate") VALUES';
const startIdx = content.indexOf(searchStr);

if (startIdx === -1) {
  console.log('Search string not found');
  process.exit(1);
}

const endIdx = content.indexOf(';', startIdx);
const insertBlock = content.substring(startIdx + searchStr.length, endIdx);

const rows = [];
const regex = /\((\d+),\s*'([^']+)',\s*'([^']+)'\)/g;
let match;
while ((match = regex.exec(insertBlock)) !== null) {
  rows.push({
    publica_id: parseInt(match[1], 10),
    from_date: match[2],
    to_date: match[3]
  });
}

console.log('Extracted rows:', rows.length);
fs.writeFileSync('public/data/publicationdis.json', JSON.stringify(rows, null, 2), 'utf-8');
console.log('Saved to public/data/publicationdis.json');
