const fs = require('fs');

const buf = fs.readFileSync('B:/himanshu uncle/exe/vsflex8.ocx');

// Parse PE headers
const peOffset = buf.readUInt32LE(0x3C);
const magic = buf.readUInt16LE(peOffset);
if (magic !== 0x4550) {
  console.log('Not PE!');
  process.exit(1);
}

const numSections = buf.readUInt16LE(peOffset + 6);
const optHeaderSize = buf.readUInt16LE(peOffset + 20);
const optHeaderOffset = peOffset + 24;
const importDirRVA = buf.readUInt32LE(optHeaderOffset + 104); // DataDirectory[1] is Import
const importDirSize = buf.readUInt32LE(optHeaderOffset + 108);

console.log('PE Import RVA:', importDirRVA.toString(16), 'Size:', importDirSize);

// Read section headers to map RVA to file offset
const sectionOffset = optHeaderOffset + optHeaderSize;
const sections = [];
for (let i = 0; i < numSections; i++) {
  const sOff = sectionOffset + i * 40;
  const name = buf.subarray(sOff, sOff + 8).toString('utf8').replace(/\0/g, '');
  const vSize = buf.readUInt32LE(sOff + 8);
  const vAddr = buf.readUInt32LE(sOff + 12);
  const rSize = buf.readUInt32LE(sOff + 16);
  const rAddr = buf.readUInt32LE(sOff + 20);
  sections.push({ name, vAddr, vSize, rAddr, rSize });
}

function rvaToFileOffset(rva) {
  for (const s of sections) {
    if (rva >= s.vAddr && rva < s.vAddr + s.vSize) {
      return s.rAddr + (rva - s.vAddr);
    }
  }
  return null;
}

const importFileOffset = rvaToFileOffset(importDirRVA);
console.log('Import Table file offset:', importFileOffset ? importFileOffset.toString(16) : 'null');

if (importFileOffset) {
  let cur = importFileOffset;
  const importedDlls = [];
  while (true) {
    const origFirstThunk = buf.readUInt32LE(cur);
    const timeStamp = buf.readUInt32LE(cur + 4);
    const forwarder = buf.readUInt32LE(cur + 8);
    const nameRVA = buf.readUInt32LE(cur + 12);
    const firstThunk = buf.readUInt32LE(cur + 16);
    if (nameRVA === 0) break;

    const nameOffset = rvaToFileOffset(nameRVA);
    if (nameOffset) {
      let dllName = '';
      for (let j = nameOffset; buf[j] !== 0; j++) {
        dllName += String.fromCharCode(buf[j]);
      }
      importedDlls.push(dllName);
    }
    cur += 20;
  }
  console.log('EXACT IMPORTED DLLS FOR VSFLEX8.OCX:');
  console.log(importedDlls);
}
