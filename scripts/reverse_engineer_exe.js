const fs = require('fs');

const exePath = 'B:/himanshu uncle/AryanNewsAgency.exe';
console.log('Reading binary:', exePath);

const buf = fs.readFileSync(exePath);
console.log('Binary size:', buf.length, 'bytes');

// Search for ASCII & UTF-16 LE strings
const asciiStrings = [];
const unicodeStrings = [];

// Extract ASCII
let currentAscii = '';
for (let i = 0; i < buf.length; i++) {
  const byte = buf[i];
  if (byte >= 32 && byte <= 126) {
    currentAscii += String.fromCharCode(byte);
  } else {
    if (currentAscii.length >= 4) {
      asciiStrings.push(currentAscii);
    }
    currentAscii = '';
  }
}

// Extract UTF-16 LE (Unicode in VB6)
let currentUnicode = '';
for (let i = 0; i < buf.length - 1; i += 2) {
  const byte1 = buf[i];
  const byte2 = buf[i + 1];
  if (byte2 === 0 && byte1 >= 32 && byte1 <= 126) {
    currentUnicode += String.fromCharCode(byte1);
  } else {
    if (currentUnicode.length >= 4) {
      unicodeStrings.push(currentUnicode);
    }
    currentUnicode = '';
  }
}

const allStrings = Array.from(new Set([...asciiStrings, ...unicodeStrings]));

console.log('Total extracted unique strings:', allStrings.length);

// Filter for SQL statements & Calculation formulas
const sqlKeywords = ['select', 'insert', 'update', 'delete', 'create', 'where', 'from', 'inner join', 'group by', 'order by', 'sum(', 'count(', 'bill', 'rate', 'customer', 'discontinue', 'holiday', 'receipt', 'hawker'];

const sqlQueries = allStrings.filter(s => {
  const lower = s.toLowerCase();
  return (lower.startsWith('select ') || lower.startsWith('insert ') || lower.startsWith('update ') || lower.startsWith('delete ') || lower.includes('from customer') || lower.includes('from bill') || lower.includes('from rate') || lower.includes('from publication') || lower.includes('from dailyprocess') || lower.includes('from discontinue'));
});

console.log('\n--- EXTRACTED SQL QUERIES & BILLING LOGIC (' + sqlQueries.length + ' found) ---');
sqlQueries.forEach((q, idx) => {
  console.log(`[Query ${idx + 1}]`, q);
});

// Also search for form names and procedure names
const formNames = allStrings.filter(s => s.toLowerCase().startsWith('frm') || s.toLowerCase().includes('form') || s.toLowerCase().includes('sub ') || s.toLowerCase().includes('function '));
console.log('\n--- EXTRACTED FORM / PROCEDURE REFERENCES ---');
console.log(formNames.slice(0, 50));

// Save all extracted queries and strings to a JSON file for analysis
fs.writeFileSync('B:/AI_Projects/Software/scripts/extracted_vb6_strings.json', JSON.stringify({
  sqlQueries,
  allStrings: allStrings.filter(s => s.length > 5 && !s.startsWith('???'))
}, null, 2));

console.log('\nSaved extracted data to B:/AI_Projects/Software/scripts/extracted_vb6_strings.json');
