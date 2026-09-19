const fs = require('fs');
const readline = require('readline');
const stream = fs.createReadStream('B:/himanshu uncle/Rahul/backup/New Project 20260730 2009.sql', { encoding: 'utf8' });
const rl = readline.createInterface({ input: stream });
const tables = new Set();

rl.on('line', (line) => {
  if (line.includes('CREATE TABLE')) {
    const parts = line.split('`');
    if (parts.length >= 2) {
      const name = parts[1];
      const base = name.replace(/\d{4,8}$/, '');
      tables.add(base);
    }
  }
});

rl.on('close', () => {
  console.log('ALL UNIQUE TABLES IN DATABASE:');
  console.log(Array.from(tables).sort());
});
