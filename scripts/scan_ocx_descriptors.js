const fs = require('fs');

const buf = fs.readFileSync('B:/himanshu uncle/exe/AryanNewsAgency.exe');

// Scan for OCX names and their preceding/following GUIDs
const ocxNames = ['VSFLEX', 'MSCOMCTL', 'MSMASK32', 'MSCAL'];

ocxNames.forEach(name => {
  let idx = 0;
  while ((idx = buf.indexOf(name, idx)) !== -1) {
    console.log(`\nFound "${name}" at offset ${idx} (0x${idx.toString(16)})`);
    const slice = buf.subarray(Math.max(0, idx - 64), Math.min(buf.length, idx + 128));
    console.log('Hex around match:', slice.toString('hex'));
    console.log('Text around match:', slice.toString('latin1').replace(/[^\x20-\x7E]/g, '.'));
    idx += name.length;
  }
});
