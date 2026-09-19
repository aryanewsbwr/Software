import fs from 'fs';

const rates = JSON.parse(fs.readFileSync('public/data/rates.json', 'utf-8'));
const ratechanges = JSON.parse(fs.readFileSync('public/data/ratechanges.json', 'utf-8'));
const publications = JSON.parse(fs.readFileSync('public/data/publications.json', 'utf-8'));

function getEffectiveWeekdayRates(publicaId, targetDateIso = '2026-09-19', rList = [], rcList = []) {
  const result = { 1: 5.0, 2: 5.0, 3: 5.0, 4: 5.0, 5: 5.0, 6: 5.0, 7: 5.0 };

  const baseRates = rList.filter(r => (r.publica_id || r.Publica_id) === publicaId);
  if (baseRates.length > 0) {
    baseRates.forEach(r => {
      const day = r.dayofweek || r.Dayofweek;
      const rateVal = Number(r.rate !== undefined ? r.rate : r.Rate);
      if (day >= 1 && day <= 7 && rateVal > 0) {
        result[day] = rateVal;
      }
    });
  }

  const matchingChanges = rcList.filter(rc => {
    const rcPub = rc.publica_id || rc.Publica_id;
    if (rcPub !== publicaId) return false;
    const rcDated = (rc.dated || rc.Dated || '').split('T')[0];
    return rcDated && rcDated <= targetDateIso;
  });

  matchingChanges.sort((a, b) => {
    const dA = (a.dated || a.Dated || '').split('T')[0];
    const dB = (b.dated || b.Dated || '').split('T')[0];
    return dA.localeCompare(dB);
  });

  matchingChanges.forEach(rc => {
    const newRate = Number(rc.new_rate !== undefined ? rc.new_rate : (rc.NewRate ?? rc.newrate ?? 0));
    const day = rc.dayofweek !== undefined ? rc.dayofweek : rc.Dayofweek;

    if (newRate > 0) {
      if (day >= 1 && day <= 7) {
        result[day] = newRate;
      } else if (day === 0 || day === null || day === undefined) {
        for (let d = 1; d <= 7; d++) {
          result[d] = newRate;
        }
      }
    }
  });

  return result;
}

console.log('--- TESTING EFFECTIVE RATE RESOLUTION ---');
const testPapers = ['THE TIMES OF INDIA', 'DAINIK BHASKAR', 'RAJASTHAN PATRIKA', 'THE HINDU', 'PUNJAB KESARI'];
testPapers.forEach(name => {
  const p = publications.find(pub => pub.public_name.toUpperCase().includes(name));
  if (p) {
    const eff = getEffectiveWeekdayRates(p.publica_id, '2026-09-19', rates, ratechanges);
    console.log(`\n${p.public_name} (ID: ${p.publica_id}, Hindi: ${p.pub_hindi || '-'}):`);
    console.log(`  Sun (1): ₹${eff[1]} | Mon (2): ₹${eff[2]} | Tue (3): ₹${eff[3]} | Wed (4): ₹${eff[4]} | Thu (5): ₹${eff[5]} | Fri (6): ₹${eff[6]} | Sat (7): ₹${eff[7]}`);
  }
});
