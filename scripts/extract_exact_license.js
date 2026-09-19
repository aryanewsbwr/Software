const fs = require('fs');

const buf = fs.readFileSync('B:/himanshu uncle/exe/AryanNewsAgency.exe');
const target = buf.indexOf('VSFLEX8');

console.log('Offset:', target);
// Look 64 bytes before VSFLEX8
const before = buf.subarray(target - 64, target);
console.log('Hex before:', before.toString('hex'));
console.log('Ascii before:', before.toString('latin1'));

// In VB6 FRX / compiled forms, the license key is stored as a length-prefixed unicode/ascii string
let licString = '';
for (let i = target - 32; i < target + 128; i++) {
  const b = buf[i];
  if (b >= 32 && b <= 126) {
    licString += String.fromCharCode(b);
  } else {
    if (licString.length >= 8) {
      console.log('Found string:', licString);
    }
    licString = '';
  }
}
