const fs = require('fs');
const data = JSON.parse(fs.readFileSync('B:/AI_Projects/Software/scripts/extracted_vb6_strings.json', 'utf8'));

console.log('--- ALL EXTRACTED QUERIES MATCHING BILLING, PROCESS & RATES ---');
data.sqlQueries.forEach((q, i) => {
  const l = q.toLowerCase();
  if (l.includes('bill') || l.includes('rate') || l.includes('temp') || l.includes('showdue') || l.includes('holiday') || l.includes('discontinue') || l.includes('balancetransfer') || l.includes('dailyprocess') || l.includes('receipt') || l.includes('customer_detail')) {
    console.log(`\n#${i + 1}: ${q}`);
  }
});
