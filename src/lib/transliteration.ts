const HINDI_COMMON_WORDS: Record<string, string> = {
  'ambuja': 'अंबुजा',
  'guest': 'गेस्ट',
  'house': 'हाउस',
  'vip': 'वीआईपी',
  'sharma': 'शर्मा',
  'verma': 'वर्मा',
  'gupta': 'गुप्ता',
  'agarwal': 'अग्रवाल',
  'kumar': 'कुमार',
  'singh': 'सिंह',
  'ram': 'राम',
  'lal': 'लाल',
  'ji': 'जी',
  'jee': 'जी',
  'hotel': 'होटल',
  'shop': 'दुकान',
  'beawar': 'ब्यावर',
  'dainik': 'दैनिक',
  'bhaskar': 'भास्कर',
  'patrika': 'पत्रिका',
  'times': 'टाइम्स',
  'india': 'इंडिया',
  'navjyoti': 'नवज्योति',
  'mohan': 'मोहन',
  'pintu': 'पिंटू',
  'bhagwati': 'भगवती',
  'prasad': 'प्रसाद',
  'dr': 'डॉक्टर',
  'advocate': 'एडवोकेट'
};

export function cleanOrTransliterateHindi(rawHindi: string | undefined, englishName: string): string {
  // If rawHindi contains genuine Unicode Devanagari characters, return it
  if (rawHindi && /[\u0900-\u097F]/.test(rawHindi)) {
    return rawHindi;
  }

  // Fallback: Transliterate common words in English name
  const words = (englishName || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const hindiWords = words.map(w => HINDI_COMMON_WORDS[w] || w);
  
  const hasHindi = hindiWords.some(w => /[\u0900-\u097F]/.test(w));
  if (hasHindi) {
    return hindiWords.join(' ');
  }

  return rawHindi || '';
}
