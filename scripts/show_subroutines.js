const fs = require('fs');
const data = JSON.parse(fs.readFileSync('B:/AI_Projects/Software/scripts/decompiled_billing_chunks.json', 'utf8'));

console.log('--- ALL EXTRACTED INTERNAL VB6 SUBROUTINES & MENU SYMBOLS ---');
data.forEach(s => {
  console.log('-', s);
});
