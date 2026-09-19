const fs = require('fs');
const buf = fs.readFileSync('B:/himanshu uncle/AryanNewsAgency.exe');

// Find all code blocks / text segments mentioning 'bill' or 'process' or 'rate'
const strList = [];
let temp = '';
for (let i = 0; i < buf.length; i++) {
  const b = buf[i];
  if (b >= 32 && b <= 126) {
    temp += String.fromCharCode(b);
  } else {
    if (temp.length >= 8) {
      strList.push(temp);
    }
    temp = '';
  }
}

const relevant = strList.filter(s => {
  const l = s.toLowerCase();
  return l.includes('bill') || l.includes('rate') || l.includes('holiday') || l.includes('discontinue') || l.includes('customer') || l.includes('receipt') || l.includes('month');
});

console.log('Total relevant string chunks:', relevant.length);
fs.writeFileSync('B:/AI_Projects/Software/scripts/decompiled_billing_chunks.json', JSON.stringify(relevant, null, 2));

console.log('Sample chunks:');
console.log(relevant.slice(0, 40));
