// Authentic Susha 05, Kruti Dev 010, and Phonetic Transliteration Engine for Aryan News Agency

// Direct Known Dictionary for 2008 Vintage Database
const KNOWN_PUBLICATIONS_HINDI: Record<string, string> = {
  'the times of india': 'द टाइम्स ऑफ इंडिया',
  'times of india': 'टाइम्स ऑफ इंडिया',
  'hindustan times': 'हिंदुस्तान टाइम्स',
  'rajasthan patrika': 'राजस्थान पत्रिका',
  'dainik bhaskar': 'दैनिक भास्कर',
  'zindia today hindi': 'इंडिया टुडे',
  'india today': 'इंडिया टुडे',
  'employment news': 'एम्प्लॉयमेंट न्यूज़',
  'rojgar samachar': 'रोजगार समाचार',
  'zindia today english': 'इंडिया टुडे (इंग्लिश)',
  'meri saheli': 'मेरी सहेली',
  'grihashobha': 'गृहशोभा',
  'the economic times': 'द इकोनॉमिक टाइम्स',
  'economic times': 'इकोनॉमिक टाइम्स',
  'vanita': 'वनिता',
  'wisdom': 'विजडम',
  'magic pot': 'मैजिक पॉट',
  'aha zindgi': 'अहा ज़िंदगी',
  'sarita': 'सरिता',
  'saras salil': 'सरस सलिल',
  'punjab kesari': 'पंजाब केसरी',
  'nafa nuksan': 'नफा नुकसान',
  'dainik navajyoti': 'दैनिक नवज्योति',
  'navajyoti': 'नवज्योति',
  'navjyoti': 'नवज्योति',
  'pratiyogita darpan': 'प्रतियोगिता दर्पण',
  'champak': 'चंपक',
  'champak(h)': 'चंपक (हिंदी)',
  'inside outside': 'इनसाइड आउटसाइड',
  'lotpot': 'लोटपोट',
  'outlook(e)': 'आउटलुक (इंग्लिश)',
  'outlook(h)': 'आउटलुक (हिंदी)',
  'vyapar': 'व्यापार',
  'business world': 'बिजनेस वर्ल्ड',
  'balhans': 'बालहंस',
  'rojgar sandesh': 'रोजगार संदेश',
  'balbhaskar': 'बाल भास्कर',
  'chotumotu': 'छोटू मोटू',
  'dalal street': 'दलाल स्ट्रीट',
  'femina': 'फेमिना',
  'capital market': 'कैपिटल मार्केट',
  'womens era': 'वुमन्स एरा',
  'business today': 'बिजनेस टुडे',
  'grihalaxmi': 'गृहलक्ष्मी',
  'vigyan pragati': 'विज्ञान प्रगति',
  'suman saurabh': 'सुमन सौरभ',
  'nandan': 'नंदन',
  'yojna': 'योजना',
  'mukta': 'मुक्ता',
  'kurushetra': 'कुरुक्षेत्र',
  'awishkar': 'आविष्कार',
  'full tansion': 'फुल टेंशन',
  'current gk chronology': 'करंट जीके क्रोनोलॉजी',
  'manohar khaniyan': 'मनोहर कहानियाँ',
  'kadambini': 'कादंबिनी',
  'cricket samrat': 'क्रिकेट सम्राट',
  'chandamama': 'चंदामामा',
  'osho times': 'ओशो टाइम्स',
  'nanhe samrat': 'नन्हे सम्राट',
  'computer sanchar suchna': 'कंप्यूटर संचार सूचना',
  'stardust': 'स्टारडस्ट',
  'hans': 'हंस',
  'sakhi jagran': 'सखी जागरण',
  'ved amrit': 'वेद अमृत'
};

const KRUTI_DEV_MAP: Record<string, string> = {
  'rajasqaana pi~ka': 'राजस्थान पत्रिका',
  'doinak Baaskr': 'दैनिक भास्कर',
  '[iNDyaa TuDo': 'इंडिया टुडे',
  'raojagaar samaacaar': 'रोजगार समाचार',
  'maorI saholaI': 'मेरी सहेली',
  'gaRhSaaoBaa': 'गृहशोभा',
  'vainata': 'वनिता',
  'Aha ijaMdgaI': 'अहा ज़िंदगी',
  'sairta': 'सरिता',
  'sarsa sailala': 'सरस सलिल',
  'pMjaaba kosarI': 'पंजाब केसरी',
  'nafa nauksaana': 'नफा नुकसान',
  'dOinak navajyaaoit': 'दैनिक नवज्योति',
  'p`ityaaoigata dp-Na': 'प्रतियोगिता दर्पण',
  'caMpk': 'चंपक',
  'laaoTpaoT': 'लोटपोट',
  'Aa}Tlauk': 'आउटलुक',
  'vyaapar': 'व्यापार',
  'baa;hMsa': 'बालहंस',
  'raojagaar saMdoSa': 'रोजगार संदेश',
  'baala Baaskr': 'बाल भास्कर',
  'CaoTU maaoTU': 'छोटू मोटू',
  'dlaala sT`,IT': 'दलाल स्ट्रीट',
  'gaRhlaEmaI': 'गृहलक्ष्मी',
  'iva&ana p`gait': 'विज्ञान प्रगति',
  'saumana saaOrBa': 'सुमन सौरभ',
  'naMdna': 'नंदन',
  'yaaojanaa': 'योजना',
  'mau@ta': 'मुक्ता',
  'ku$Eaot`': 'कुरुक्षेत्र',
  'AivaYakar': 'आविष्कार',
  'krnT jaIko k`aonaaolaa^jaI': 'करंट जीके क्रोनोलॉजी',
  'manaaohr khainayaaM': 'मनोहर कहानियाँ',
  'kadimbanaI': 'कादंबिनी',
  'ik`koT sama`aT': 'क्रिकेट सम्राट',
  'candamaamaa': 'चंदामामा',
  'AaoSaao Tašmsa': 'ओशो टाइम्स',
  'nanho sama`aT': 'नन्हे सम्राट',
  'kmpyaUTr saMcaar saUcanaa': 'कंप्यूटर संचार सूचना',
  'sTarDsT': 'स्टारडस्ट',
  'hMsa': 'हंस',
  'saKI jaagarNa': 'सखी जागरण',
  'vaod AmaRt': 'वेद अमृत'
};

const COMMON_WORDS_TRANSLIT: Record<string, string> = {
  'the': 'द',
  'times': 'टाइम्स',
  'of': 'ऑफ',
  'india': 'इंडिया',
  'economic': 'इकोनॉमिक',
  'hindustan': 'हिंदुस्तान',
  'rajasthan': 'राजस्थान',
  'patrika': 'पत्रिका',
  'dainik': 'दैनिक',
  'bhaskar': 'भास्कर',
  'navajyoti': 'नवज्योति',
  'navjyoti': 'नवज्योति',
  'punjab': 'पंजाब',
  'kesari': 'केसरी',
  'express': 'एक्सप्रेस',
  'today': 'टुडे',
  'news': 'न्यूज़',
  'samachar': 'समाचार',
  'sandesh': 'संदेश',
  'morning': 'प्रातःकालीन',
  'evening': 'सायंकालीन',
  'daily': 'दैनिक',
  'weekly': 'साप्ताहिक',
  'monthly': 'मासिक',
  'magazine': 'पत्रिका',
  'beawar': 'ब्यावर',
  'rajendra': 'राजेन्द्र',
  'rajesh': 'राजेश',
  'rajnish': 'रजनीश',
  'sharma': 'शर्मा',
  'verma': 'वर्मा',
  'gupta': 'गुप्ता',
  'agarwal': 'अग्रवाल',
  'agrawal': 'अग्रवाल',
  'kumar': 'कुमार',
  'singh': 'सिंह',
  'ram': 'राम',
  'lal': 'लाल',
  'mohan': 'मोहन',
  'pintu': 'पिंटू',
  'bhagwati': 'भगवती',
  'prasad': 'प्रसाद',
  'jain': 'जैन',
  'chand': 'चंद',
  'chandra': 'चन्द्र',
  'ji': 'जी',
  'jee': 'जी',
  'hotel': 'होटल',
  'shop': 'दुकान',
  'guest': 'गेस्ट',
  'house': 'हाउस',
  'ambuja': 'अम्बुजा',
  'vip': 'वीआईपी',
  'dr': 'डॉ',
  'mr': 'श्री',
  'mrs': 'श्रीमती',
  'shri': 'श्री',
  'shree': 'श्री',
  'soni': 'सोनी',
  'garg': 'गर्ग',
  'mathur': 'माथुर',
  'pathak': 'पाठक',
  'pandit': 'पंडित',
  'nigam': 'निगम',
  'joshi': 'जोशी',
  'rathore': 'राठौड़',
  'deepak': 'दीपक',
  'sunil': 'सुनील',
  'vinay': 'विनय',
  'vikas': 'विकास',
  'pankaj': 'पंकज',
  'dangi': 'डांगी',
  'jangid': 'जांगिड़',
  'bohra': 'बोहरा',
  'arun': 'अरुण',
  'babulal': 'बाबूलाल',
  'suman': 'सुमन',
  'mohammad': 'मोहम्मद',
  'shekhawat': 'शेखावत',
  'chauhan': 'चौहान',
  'sandeep': 'संदीप',
  'yogesh': 'योगेश',
  'yogendra': 'योगेन्द्र',
  'surendra': 'सुरेन्द्र',
  'devendra': 'देवेन्द्र',
  'jitendra': 'जितेन्द्र',
  'vipendra': 'विपेन्द्र',
  'mahesh': 'महेश',
  'suresh': 'सुरेश',
  'dinesh': 'दिनेश',
  'mukesh': 'मुकेश',
  'rakesh': 'राकेश',
  'manish': 'मनीष',
  'raghuvir': 'रघुवीर',
  'raghuveer': 'रघुवीर',
  'ebran': 'इबरन',
  'tak': 'टाक'
};

// Susha 05 Pre-Replacement Dictionary for 2008 Vintage Database
const SUSHA_PRE_RULES: [RegExp, string][] = [
  [/vaIAa[\x00-\xFF]?pI/gi, 'वीआईपी'],
  [/ha\]sa/gi, 'हाउस'],
  [/Aga`vaala/g, 'अग्रवाल'],
  [/rajaond`/g, 'राजेन्द्र'],
  [/yaaogaond`/g, 'योगेन्द्र'],
  [/naond`/g, 'नेन्द्र'],
  [/dovand`/g, 'देवेन्द्र'],
  [/sauryand`/g, 'सुरेन्द्र'],
  [/ijatond`/g, 'जितेन्द्र'],
  [/ivapond`/g, 'विपेन्द्र'],
  [/kumaar/gi, 'कुमार'],
  [/Samaa\-/g, 'शर्मा'],
  [/gaga\-/g, 'गर्ग'],
  [/vaarmaa\-/g, 'वर्मा'],
  [/rGauvaIr/g, 'रघुवीर'],
  [/razaOD/g, 'राठौड़'],
  [/saaonaI/g, 'सोनी'],
  [/manaIYa/g, 'मनीष'],
  [/yaaogaoSa/g, 'योगेश'],
  [/maaqaur/g, 'माथुर'],
  [/rakoSa/g, 'राकेश'],
  [/pazk/g, 'पाठक'],
  [/caMdna/g, 'चंदन'],
  [/isaMh/g, 'सिंह'],
  [/saMdIp/g, 'संदीप'],
  [/caaOhana/g, 'चौहान'],
  [/inagama/g, 'निगम'],
  [/jaOna/g, 'जैन'],
  [/dIpk/g, 'दीपक'],
  [/jaaoSaI/g, 'जोशी'],
  [/sauinala/g, 'सुनील'],
  [/raoyala/g, 'रोयल'],
  [/ivanaya/g, 'विनय'],
  [/ivakasa/g, 'विकास'],
  [/gauPta/g, 'गुप्ता'],
  [/gaPta/g, 'गुप्ता'],
  [/ebarna/g, 'इबरन'],
  [/Ambaujaa/g, 'अम्बुजा'],
  [/gaOsT/g, 'गेस्ट'],
  [/raGava/g, 'राघव'],
  [/saMjaya/g, 'संजय'],
  [/iSavaSaMkr/g, 'शिवशंकर'],
  [/SaoKrna/g, 'शेखरन'],
  [/SaoKavat/g, 'शेखावत'],
  [/pMkja/g, 'पंकज'],
  [/DaMgaI/g, 'डांगी'],
  [/jaaMgaID/g, 'जांगिड़'],
  [/rajaoSa/g, 'राजेश'],
  [/rjanaISa/g, 'रजनीश'],
  [/baaohra/g, 'बोहरा'],
  [/A\$Na/g, 'अरुण'],
  [/baabaUlaala/g, 'बाबूलाल'],
  [/saumana/g, 'सुमन'],
  [/piNDt/g, 'पंडित'],
  [/maaOhmmad/g, 'मोहम्मद'],
  [/Tak/g, 'टाक'],
  [/jaI/g, 'जी'],
  [/Da\s+/g, 'डॉ '],
  [/Da\./g, 'डॉ.'],
  [/ema\s+ko/g, 'एम के'],
  [/esa\s+ko/g, 'एस के'],
  [/ko\s+ko/g, 'के के'],
  [/Aar\s+ko/g, 'आर के'],
  [/vaI\s+pI/g, 'वी पी'],
  [/ema\s+esa/g, 'एम एस'],
  [/DI(\d+)?/g, 'डी$1'],
  [/saI(\d+)?/g, 'सी$1'],
  [/baI(\d+)?/g, 'बी$1']
];

const SUSHA_CHAR_MAP: [string, string][] = [
  ['Aao', 'ओ'], ['AaO', 'औ'], ['Aa', 'आ'], ['A', 'अ'],
  ['ena', 'एन'], ['esa', 'एस'], ['ema', 'एम'], ['Aar', 'आर'],
  ['ko', 'के'], ['DI', 'डी'], ['saI', 'सी'], ['baI', 'बी'],
  ['e', 'ए'], ['E', 'ऐ'], ['aao', 'ो'], ['ao', 'ो'], ['o', 'े'], ['O', 'ै'],
  ['aa', 'ा'], ['aaO', 'ौ'], ['aO', 'ौ'],
  ['a', ''], ['I', 'ी'], ['u', 'ु'], ['U', 'ू'],
  ['k', 'क'], ['K', 'ख'], ['g', 'ग'], ['G', 'घ'],
  ['c', 'च'], ['C', 'छ'], ['j', 'ज'], ['J', 'झ'],
  ['T', 'ट'], ['z', 'ठ'], ['D', 'ड'], ['Z', 'ढ'], ['N', 'ण'],
  ['t', 'त'], ['q', 'थ'], ['d', 'द'], ['Q', 'ध'], ['n', 'न'],
  ['p', 'प'], ['P', 'फ'], ['b', 'ब'], ['B', 'भ'], ['m', 'म'],
  ['y', 'य'], ['r', 'र'], ['l', 'ल'], ['v', 'व'], ['w', 'व'],
  ['S', 'श'], ['Y', 'ष'], ['s', 'स'], ['h', 'ह'],
  ['M', 'ं'], ['^', 'ँ'], [':', 'ः'], ['`', '्र'], ['-', 'र्']
];

/**
 * Decodes legacy 2008 Susha 05 ASCII font strings to Unicode Devanagari Hindi
 */
export function sushaToUnicode(text: string): string {
  if (!text) return '';
  if (/[\u0900-\u097F]/.test(text)) return text;

  let s = text;
  for (const [pattern, rep] of SUSHA_PRE_RULES) {
    s = s.replace(pattern, rep);
  }

  const words = s.split(' ');
  const outWords = words.map(w => {
    if (!w || /[\u0900-\u097F]/.test(w)) return w;
    let cw = w.replace(/i([kKgGcCjJTzZDZNtqdnpPmbBmyrlvwsSYh])/g, '$1ि');
    let res = '';
    let i = 0;
    while (i < cw.length) {
      if (cw.charCodeAt(i) >= 0x0900 && cw.charCodeAt(i) <= 0x097F) {
        res += cw[i++];
        continue;
      }
      let matched = false;
      for (const [k, v] of SUSHA_CHAR_MAP) {
        if (cw.startsWith(k, i)) {
          res += v;
          i += k.length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        res += cw[i++];
      }
    }
    return res.replace(/([क-ह])र्/g, 'र्$1');
  });

  return outWords.join(' ');
}

// Single English letter initials to Hindi
const ENGLISH_INITIALS: Record<string, string> = {
  'a': 'ए', 'b': 'बी', 'c': 'सी', 'd': 'डी', 'e': 'ई', 'f': 'एफ',
  'g': 'जी', 'h': 'एच', 'i': 'आई', 'j': 'जे', 'k': 'के', 'l': 'एल',
  'm': 'एम', 'n': 'एन', 'o': 'ओ', 'p': 'पी', 'q': 'क्यू', 'r': 'आर',
  's': 'एस', 't': 'टी', 'u': 'यू', 'v': 'वी', 'w': 'डब्ल्यू', 'x': 'एक्स',
  'y': 'वाई', 'z': 'ज़ेड'
};

/**
 * Phonetic transliterator from English to Hindi Unicode
 */
export function englishToHindiPhonetic(str: string): string {
  if (!str) return '';
  const trimmed = str.trim().toLowerCase();
  
  // Check known full publication names
  if (KNOWN_PUBLICATIONS_HINDI[trimmed]) {
    return KNOWN_PUBLICATIONS_HINDI[trimmed];
  }

  // Word-by-word transliteration
  const words = str.split(/\s+/);
  const converted = words.map(w => {
    const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!clean) return w;

    // Digits
    if (/^\d+$/.test(clean)) return clean;

    // Single English initial (e.g. N -> एन, K -> के, C -> सी)
    if (clean.length === 1 && ENGLISH_INITIALS[clean]) {
      return ENGLISH_INITIALS[clean];
    }

    // Common words & names
    if (COMMON_WORDS_TRANSLIT[clean]) {
      return COMMON_WORDS_TRANSLIT[clean];
    }

    // Compound like C17 or D25 or 5RHB
    if (/^[a-z]\d+$/i.test(w)) {
      const charPart = w[0].toLowerCase();
      const numPart = w.slice(1);
      return (ENGLISH_INITIALS[charPart] || charPart) + numPart;
    }

    return transliterateSingleWord(clean) || w;
  });

  return converted.join(' ');
}

/**
 * Basic phonetic character transliteration
 */
function transliterateSingleWord(w: string): string {
  if (!w) return '';
  
  // Try known patterns
  let res = w
    .replace(/shh/g, 'ष्')
    .replace(/sh/g, 'श')
    .replace(/ch/g, 'च')
    .replace(/th/g, 'थ')
    .replace(/dh/g, 'ध')
    .replace(/bh/g, 'भ')
    .replace(/kh/g, 'ख')
    .replace(/gh/g, 'घ')
    .replace(/ph/g, 'फ')
    .replace(/jh/g, 'झ')
    .replace(/ndra/g, 'न्द्र')
    .replace(/ndr/g, 'न्द्र')
    .replace(/endra/g, 'ेन्द्र')
    .replace(/dra/g, 'द्र')
    .replace(/tra/g, 'त्र')
    .replace(/ksha/g, 'क्ष')
    .replace(/gya/g, 'ज्ञ')
    .replace(/aa/g, 'ा')
    .replace(/ee/g, 'ी')
    .replace(/oo/g, 'ू')
    .replace(/ai/g, 'ै')
    .replace(/au/g, 'ौ')
    .replace(/k/g, 'क')
    .replace(/g/g, 'ग')
    .replace(/j/g, 'ज')
    .replace(/t/g, 'ट')
    .replace(/d/g, 'ड')
    .replace(/n/g, 'न')
    .replace(/p/g, 'प')
    .replace(/b/g, 'ब')
    .replace(/m/g, 'म')
    .replace(/y/g, 'य')
    .replace(/r/g, 'र')
    .replace(/l/g, 'ल')
    .replace(/v/g, 'व')
    .replace(/w/g, 'व')
    .replace(/s/g, 'स')
    .replace(/h/g, 'ह')
    .replace(/a/g, 'ा')
    .replace(/i/g, 'ि')
    .replace(/u/g, 'ु')
    .replace(/e/g, 'े')
    .replace(/o/g, 'ो');

  return res;
}

/**
 * Cleans or converts Susha 05, Kruti Dev, or English string to clean Unicode Devanagari Hindi
 */
export function cleanOrTransliterateHindi(rawHindi: string | undefined, englishName: string): string {
  // If already contains genuine Unicode Hindi characters
  if (rawHindi && /[\u0900-\u097F]/.test(rawHindi)) {
    return rawHindi;
  }

  // Check Kruti Dev map
  if (rawHindi && KRUTI_DEV_MAP[rawHindi.trim()]) {
    return KRUTI_DEV_MAP[rawHindi.trim()];
  }

  // Check Susha font decoding if rawHindi looks like Susha ASCII
  if (rawHindi && rawHindi.trim().length > 0) {
    const decoded = sushaToUnicode(rawHindi.trim());
    if (decoded && /[\u0900-\u097F]/.test(decoded)) {
      return decoded;
    }
  }

  // Check known publications
  const engLower = (englishName || '').trim().toLowerCase();
  if (KNOWN_PUBLICATIONS_HINDI[engLower]) {
    return KNOWN_PUBLICATIONS_HINDI[engLower];
  }

  // Check English phonetic transliteration
  if (englishName && englishName.trim().length > 0) {
    return englishToHindiPhonetic(englishName);
  }

  return rawHindi || '';
}

