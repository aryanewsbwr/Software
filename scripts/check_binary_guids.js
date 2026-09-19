const fs = require('fs');

const b1 = fs.readFileSync('B:/himanshu uncle/exe/AryanNewsAgency.exe');
const b2 = fs.readFileSync('B:/himanshu uncle/exe/AryanNewsAgency_Unlocked.exe');

function extractGuids(buf) {
  const hex = buf.toString('hex');
  // Visual Basic 6 stores GUIDs in binary struct format:
  // Data1 (4 bytes, little endian), Data2 (2 bytes, LE), Data3 (2 bytes, LE), Data4 (8 bytes, BE)
  // Let's search for known VSFlexGrid GUIDs:
  // BEEECC20-4D5F-4F8B-BFDC-5D9B6FBDE09D
  // Binary: 20 cc ee be 5f 4d 8b 4f bf dc 5d 9b 6f bd e0 9d
  const target1 = '20cceebe5f4d8b4fbfdc5d9b6fbde09d';
  console.log('Target VSFlex8 CLSID found at:', hex.indexOf(target1) / 2);
}

console.log('--- Checking AryanNewsAgency.exe ---');
extractGuids(b1);
console.log('--- Checking AryanNewsAgency_Unlocked.exe ---');
extractGuids(b2);
