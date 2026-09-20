const fs = require('fs');

const generalTitles = [
  "చందమామ కథలు", "బేతాళ కథలు", "రామాయణం", "మహాభారతం", "భాగవతం",
  "తెలుగు సామెతలు", "వేమన పద్యాలు", "సుమతీ శతకం", "శ్రీకృష్ణ దేవరాయల కథలు", "తెనాలి రామకృష్ణ కథలు",
  "బాలల నీతి కథలు", "పంచతంత్ర కథలు", "అక్బర్ బీర్బల్ కథలు", "పరమానందయ్య శిష్యుల కథలు", "కాకతీయుల చరిత్ర"
];

const generalAuthors = [
  "విశ్వనాథ సత్యనారాయణ", "శ్రీ శ్రీ", "బమ్మెర పోతన", "నన్నయ్య", "తిక్కన", "ఎర్రాప్రగడ",
  "వేమన", "బద్దెన", "చిలకమర్తి లక్ష్మీనరసింహం", "కందుకూరి వీరేశలింగం", "గురజాడ అప్పారావు"
];

const palmTitles = [
  "ఆయుర్వేద రహస్యాలు", "జ్యోతిష్య శాస్త్రం", "వాస్తు శాస్త్రం", "మంత్ర యంత్ర తంత్రాలు", "సిద్ధ వైద్యం",
  "నాడి జ్యోతిష్యం", "సాముద్రిక లక్షణాలు", "యోగాసనాలు", "ప్రాచీన శిల్పకళ", "రసవాద విద్య",
  "విమాన శాస్త్రం", "అశ్వ శాస్త్రం", "గజ శాస్త్రం", "సంగీత రత్నాకరం", "నాట్య శాస్త్రం"
];

const generateBooks = () => {
  const books = [];
  
  // Existing books placeholder if needed, but here we just generate new ones to append
  
  // 1. Generate 200 General Books
  for (let i = 1; i <= 200; i++) {
    const titleBase = generalTitles[i % generalTitles.length];
    const author = generalAuthors[i % generalAuthors.length];
    books.push({
      id: `gen-book-${i}`,
      title: `${titleBase} - భాగం ${i}`,
      author: author,
      description: `ఇది పాత కాలపు చారిత్రక, నీతి మరియు విజ్ఞానపరమైన విషయాలతో కూడిన ఒక అద్భుతమైన పుస్తకం. పాఠకులకు ఎంతో ఆసక్తిని కలిగించే కథనంతో సాగుతుంది. సంపుటి ${i}.`,
      category: i % 2 === 0 ? "సాధారణ గ్రంథాలయం (General Books)" : "Classics",
      costToUnlock: Math.floor(Math.random() * 30) + 10,
      costPerMinute: 1,
      chapters: [
        {
          id: `gen-book-${i}-ch-1`,
          title: `అధ్యాయం 1: ప్రారంభం`,
          content: `పూర్వం ఒక ఊరిలో... (గ్రంథంలోని మొదటి అధ్యాయపు వివరణ ఇక్కడ ఉంటుంది). ఇది కేవలం ఉదాహరణ కోసం ఉంచబడిన పాఠ్యం.`
        },
        {
          id: `gen-book-${i}-ch-2`,
          title: `అధ్యాయం 2: ప్రధాన ఘట్టం`,
          content: `కథలో ప్రధానమైన మలుపులు, పాత్రల ప్రవేశం ఈ అధ్యాయంలో వివరించబడ్డాయి. పాఠకులకు ఇదొక చక్కని అనుభవం.`
        }
      ]
    });
  }

  // 2. Generate 100 Palm Leaf Manuscripts
  for (let i = 1; i <= 100; i++) {
    const titleBase = palmTitles[i % palmTitles.length];
    const author = "ప్రాచీన ఋషులు / సిద్ధులు";
    books.push({
      id: `palm-book-${i}`,
      title: `${titleBase} (తాళపత్ర గ్రంథం ${i})`,
      author: author,
      description: `ప్రాచీన తాళపత్ర గ్రంథాల నుండి సేకరించబడిన అరుదైన మరియు నిగూఢమైన రహస్యాలు. అనేక వేల సంవత్సరాల నాటి భారతీయ విజ్ఞానం ఈ తాళపత్ర నిధిలో భద్రపరచబడింది. భాగం ${i}.`,
      category: "తాళపత్ర గ్రంథాలు",
      costToUnlock: Math.floor(Math.random() * 50) + 20,
      costPerMinute: 1,
      chapters: [
        {
          id: `palm-book-${i}-ch-1`,
          title: `ప్రథమ పత్రం (తాళపత్రం 1)`,
          content: `ఓం శ్రీ గురుభ్యో నమః. ఈ తాళపత్రంలో మానవ కళ్యాణం కోసం మహర్షులు అందించిన విశేషమైన జ్ఞానం పొందుపరచబడింది. యోగ, ధ్యాన, వైద్య రహస్యాలు ఇందులో ఉన్నాయి.`
        },
        {
          id: `palm-book-${i}-ch-2`,
          title: `ద్వితీయ పత్రం (తాళపత్రం 2)`,
          content: `ప్రకృతిలోని మూలికలు, గ్రహాల గతులు, మానవ శరీరంపై వాటి ప్రభావం గురించి సిద్ధులు వ్రాసిన అద్భుతమైన గ్రంథం.`
        }
      ]
    });
  }
  
  return books;
};

const newBooks = generateBooks();
const newBooksJson = JSON.stringify(newBooks, null, 2);

const existingData = fs.readFileSync('src/data/books.ts', 'utf8');

// Check if array is empty (i.e., contains '[]' or only whitespace inside)
const emptyArrayRegex = /INITIAL_BOOKS:\s*Book\[\]\s*=\s*\[\s*\]/;
const isEmpty = emptyArrayRegex.test(existingData);

if (isEmpty) {
  // If empty, replace '[]' with the new books JSON
  const modifiedData = existingData.replace(/INITIAL_BOOKS:\s*Book\[\]\s*=\s*\[\s*\]/, `INITIAL_BOOKS: Book[] = ${newBooksJson}`);
  fs.writeFileSync('src/data/books.ts', modifiedData, 'utf8');
  console.log('Added 300 books successfully to empty list.');
} else {
  // Find the end of the INITIAL_BOOKS array (the last `];`)
  const lastBracketIndex = existingData.lastIndexOf(']');
  if (lastBracketIndex !== -1) {
    // We need to inject our items right before this closing bracket.
    // The string to inject needs a leading comma.
    let innerJson = newBooksJson.trim();
    // Remove [ and ] from JSON
    innerJson = innerJson.substring(1, innerJson.length - 1);
    
    const modifiedData = existingData.slice(0, lastBracketIndex) + ',\n  ' + innerJson + '\n' + existingData.slice(lastBracketIndex);
    fs.writeFileSync('src/data/books.ts', modifiedData, 'utf8');
    console.log('Added 300 books successfully.');
  } else {
    console.error('Could not find end of INITIAL_BOOKS array.');
  }
}

