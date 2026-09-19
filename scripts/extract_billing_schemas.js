const fs = require('fs');
const readline = require('readline');

const stream = fs.createReadStream('B:/himanshu uncle/Rahul/backup/New Project 20260730 2009.sql', { encoding: 'utf8' });
const rl = readline.createInterface({ input: stream });

let capture = false;
let currentTable = '';
const schemas = {};

rl.on('line', (line) => {
  if (line.includes('CREATE TABLE')) {
    const m = line.match(/CREATE TABLE \`([^\`]+)\`/);
    if (m) {
      currentTable = m[1];
      if (['rate', 'ratechange', 'holiday', 'discontinue', 'showdue', 'balancetransfer', 'bill20082009', 'billno20082009', 'customer_detail'].includes(currentTable)) {
        capture = true;
        schemas[currentTable] = [];
      }
    }
  }

  if (capture) {
    schemas[currentTable].push(line);
    if (line.includes('ENGINE=') || line.includes('TYPE=') || line.endsWith(';')) {
      capture = false;
    }
  }
});

rl.on('close', () => {
  console.log('--- REVERSE ENGINEERED DATABASE SCHEMAS ---');
  for (const [tbl, lines] of Object.entries(schemas)) {
    console.log(`\nTABLE [${tbl}]:\n` + lines.join('\n'));
  }
});
