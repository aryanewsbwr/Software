const fs = require('fs');

const buf = fs.readFileSync('B:/himanshu uncle/AryanNewsAgency.exe');

// Search for any .ocx, .dll, or ProgIDs
const ascii = [];
let cur = '';
for (let i = 0; i < buf.length; i++) {
  const b = buf[i];
  if (b >= 32 && b <= 126) {
    cur += String.fromCharCode(b);
  } else {
    if (cur.length >= 4) ascii.push(cur);
    cur = '';
  }
}

const ocxAndDlls = ascii.filter(s => {
  const l = s.toLowerCase();
  return l.endsWith('.ocx') || l.endsWith('.dll') || l.endsWith('.tlb') || l.endsWith('.olb');
});

console.log('ALL REFERENCED OCX AND DLL FILES:');
console.log(Array.from(new Set(ocxAndDlls)));

// Also search for GUIDs (CLSID)
const guidRegex = /\{[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}/g;
const guids = (buf.toString('latin1').match(guidRegex) || []);
console.log('\nALL REFERENCED GUIDs (' + guids.length + ' found):');
console.log(Array.from(new Set(guids)).slice(0, 30));
