const fs = require('fs');

const buf = fs.readFileSync('B:/himanshu uncle/exe/vsflex8.ocx');
const text = buf.toString('latin1');

// Extract all GUIDs from the OCX
const guidMatches = text.match(/\{[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}/g) || [];
console.log('GUIDs found in vsflex8.ocx:', Array.from(new Set(guidMatches)));

// Find all CLSID strings
const clsids = [];
let idx = 0;
while ((idx = text.indexOf('CLSID\\', idx)) !== -1) {
  clsids.push(text.substring(idx, idx + 50).split('\0')[0]);
  idx += 6;
}
console.log('CLSID paths:', Array.from(new Set(clsids)));

// Find TypeLib strings
const typelibs = [];
idx = 0;
while ((idx = text.indexOf('TypeLib\\', idx)) !== -1) {
  typelibs.push(text.substring(idx, idx + 50).split('\0')[0]);
  idx += 8;
}
console.log('TypeLib paths:', Array.from(new Set(typelibs)));
