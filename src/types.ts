export interface AgentStatus {
  id: string;
  name: string;
  role: string;
  status: 'ACTIVE' | 'IDLE' | 'PROCESSING';
  description: string;
  lastAction: string;
  tasksCompleted: number;
  badgeColor: string;
}

export interface User {
  email: string;
  name: string;
  picture?: string;
  credits: number;
}

export type ContentType = 'text' | 'audio' | 'video';

export interface WriterApplication {
  id: string;
  name: string;
  email: string;
  bio: string;
  bookTitle: string;
  contentType: ContentType;
  audioUrl?: string; // Audio file / recording data URL
  videoUrl?: string; // Video URL / stream / data URL
  storyText?: string; // Text story or script
  category?: string;
  coverImage?: string;
  language?: string; // Selected language for the uploaded content
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export interface RegisteredTree {
  id: string;
  treeName: string;
  botanicalName: string;
  sanskritNames: string[];
  teluguNames: string[];
  hindiNames: string[];
  tamilNames: string[];
  kannadaNames: string[];
  englishNames: string[];
  otherNames: string[];
  description: string;
  medicinalUses: string;
  planterName: string;
  photoUrl: string;
  location: string;
  datePlanted: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  audioUrl?: string;
  videoUrl?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  contentType?: ContentType; // 'text' | 'audio' | 'video'
  audioUrl?: string; // Direct audio playback URL or data URL
  videoUrl?: string; // Direct video playback URL or YouTube/MP4 URL
  coverImage?: string;
  chapters: Chapter[];
  costToUnlock: number; // Credit cost to purchase/unlock
  costPerMinute: number; // Cost to read per minute
  isUnlocked?: boolean;
  isSampleMode?: boolean;
  folderId?: string; // Links to hierarchical folder
  language?: string; // Language of the book/content
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null; // For hierarchical structure
}

export interface CreditTransaction {
  id: string;
  timestamp: string;
  amount: number; // Negative for reading/unlock, positive for top-up
  description: string;
  type: 'unlock' | 'session' | 'topup' | 'bonus';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  suggestedBooks?: Book[]; // AI suggested books to read
}

export type LanguageCode = 
  | 'en' 
  | 'te' 
  | 'hi' 
  | 'ta' 
  | 'kn' 
  | 'ml' 
  | 'mr' 
  | 'bn' 
  | 'gu' 
  | 'pa' 
  | 'or' 
  | 'es';

export interface UIStrings {
  title: string;
  subtitle: string;
  loginWithGmail: string;
  chatPlaceholder: string;
  searchBooks: string;
  folders: string;
  createFolder: string;
  renameFolder: string;
  deleteFolder: string;
  addBook: string;
  credits: string;
  topup: string;
  ratePerMin: string;
  costToUnlock: string;
  unlockBook: string;
  startReading: string;
  stopReading: string;
  insufficientCredits: string;
  chatAgentTitle: string;
  chatAgentDesc: string;
  readerPage: string;
  readingSessionActive: string;
  bookUnlockedSuccess: string;
  languageSelect: string;
  logout: string;
  allBooks: string;
  noBooksInFolder: string;
  transactionHistory: string;
  adminPanel: string;
  libraryBtn: string;
  categories: string;
  cultureHeritage: string;
  techScience: string;
  kidsEducation: string;
  mantrasSpirituality: string;
  literatureNovels: string;
  allCategories: string;
  downloadRate: string;
  newChat?: string;
  prompt1?: string;
  prompt2?: string;
  prompt3?: string;
}

export const TRANSLATIONS: Record<LanguageCode, UIStrings> = {
  en: {
    title: "All in One Library",
    subtitle: "Universal Knowledge Hub",
    loginWithGmail: "Login with Gmail",
    chatPlaceholder: "Ask about any book, author, or search topic...",
    searchBooks: "Search Books",
    folders: "Folders",
    createFolder: "New Folder",
    renameFolder: "Rename Folder",
    deleteFolder: "Delete Folder",
    addBook: "Add Book",
    credits: "Credits",
    topup: "Top Up Credits",
    ratePerMin: "credits / min",
    costToUnlock: "Credits to Unlock",
    unlockBook: "Unlock Book",
    startReading: "Start Reading",
    stopReading: "Stop Reading Session",
    insufficientCredits: "Insufficient credits! Please top up.",
    chatAgentTitle: "Brahmastra 3.5 Ultra (బ్రహ్మాస్త్ర 3.5 అల్ట్రా)",
    chatAgentDesc: "Universal AI Agent • Instant Book Delivery, Free Audio & Reading",
    readerPage: "Page",
    readingSessionActive: "Reading Session Active",
    bookUnlockedSuccess: "Book unlocked successfully!",
    languageSelect: "Change Language",
    logout: "Logout",
    allBooks: "All Library Books",
    noBooksInFolder: "No books in this folder yet. Drag books here or use the AI to add them!",
    transactionHistory: "Transaction History",
    adminPanel: "Admin Panel",
    libraryBtn: "Library Explorer",
    categories: "Categories",
    cultureHeritage: "Culture & Heritage",
    techScience: "Technology & Science",
    kidsEducation: "Kids & Education",
    mantrasSpirituality: "Mantras & Spirituality",
    literatureNovels: "Literature & Novels",
    allCategories: "All Categories",
    downloadRate: "Download / Unlock Rate",
    newChat: "New Chat",
    prompt1: "Give me Panchatantra Stories book",
    prompt2: "Bhagavad Gita slokas & meaning",
    prompt3: "The Art of War classic book"
  },
  te: {
    title: "ఆల్ ఇన్ వన్ లైబ్రరీ",
    subtitle: "సార్వత్రిక జ్ఞాన కేంద్రం",
    loginWithGmail: "జిమెయిల్ తో లాగిన్ అవ్వండి",
    chatPlaceholder: "ఏదైనా పుస్తకం, రచయిత లేదా అంశం గురించి అడగండి...",
    searchBooks: "పుస్తకాలను శోధించండి",
    folders: "ఫోల్డర్లు",
    createFolder: "కొత్త ఫోల్డర్",
    renameFolder: "పేరు మార్చు",
    deleteFolder: "ఫోల్డర్ తొలగించు",
    addBook: "పుస్తకాన్ని జోడించు",
    credits: "క్రెడిట్స్",
    topup: "క్రెడిట్స్ రీఛార్జ్",
    ratePerMin: "క్రెడిట్స్ / నిమిషానికి",
    costToUnlock: "అన్‌లాక్ చేయడానికి క్రెడిట్స్",
    unlockBook: "పుస్తకాన్ని అన్‌లాక్ చేయండి",
    startReading: "చదవడం ప్రారంభించండి",
    stopReading: "చదవడం ముగించండి",
    insufficientCredits: "క్రెడిట్స్ సరిపోవు! దయచేసి రీఛార్జ్ చేయండి.",
    chatAgentTitle: "బ్రహ్మాస్త్ర 3.5 అల్ట్రా",
    chatAgentDesc: "సార్వత్రిక AI ఏజెంట్ • పుస్తకాల తక్షణ డెలివరీ, ఉచిత ఆడియో & పఠనం",
    readerPage: "పేజీ",
    readingSessionActive: "పఠన సెషన్ ప్రారంభమైంది",
    bookUnlockedSuccess: "పుస్తకం విజయవంతంగా అన్‌లాక్ చేయబడింది!",
    languageSelect: "భాషను మార్చండి",
    logout: "లాగ్అవుట్",
    allBooks: "అన్ని పుస్తకాలు",
    noBooksInFolder: "ఈ ఫోల్డర్‌లో ఇంకా పుస్తకాలు లేవు. పుస్తకాలను ఇక్కడికి చేర్చండి లేదా AIని అడగండి!",
    transactionHistory: "లావాదేవీల చరిత్ర",
    adminPanel: "అడ్మిన్ ప్యానెల్",
    libraryBtn: "లైబ్రరీ (Library)",
    categories: "కేటగిరీలు",
    cultureHeritage: "సాంస్కృతి & వారసత్వం",
    techScience: "సాంకేతికత & సైన్స్",
    kidsEducation: "పిల్లలు & విద్య",
    mantrasSpirituality: "మంత్రాలు & ఆధ్యాత్మికత",
    literatureNovels: "సాహిత్యం & నవలలు",
    allCategories: "అన్ని కేటగిరీలు",
    downloadRate: "డౌన్‌లోడ్ / అన్‌లాక్ చార్జ్",
    newChat: "New Chat",
    prompt1: "Give me Panchatantra Stories book",
    prompt2: "Bhagavad Gita slokas & meaning",
    prompt3: "The Art of War classic book"
  },
  hi: {
    title: "ऑल इन वन लाइब्रेरी",
    subtitle: "सार्वभौमिक ज्ञान केंद्र",
    loginWithGmail: "जीमेल के साथ लॉगिन करें",
    chatPlaceholder: "किसी भी पुस्तक, लेखक या विषय के बारे में पूछें...",
    searchBooks: "पुस्तकें खोजें",
    folders: "फ़ोल्डर",
    createFolder: "नया फ़ोल्डर",
    renameFolder: "नाम बदलें",
    deleteFolder: "फ़ोल्डर हटाएं",
    addBook: "पुस्तक जोड़ें",
    credits: "क्रेडिट",
    topup: "क्रेडिट टॉप अप",
    ratePerMin: "क्रेडिट / मिनट",
    costToUnlock: "अनलॉक करने के लिए क्रेडिट",
    unlockBook: "पुस्तक अनलॉक करें",
    startReading: "पढ़ना शुरू करें",
    stopReading: "सत्र समाप्त करें",
    insufficientCredits: "अपर्याप्त क्रेडिट! कृपया टॉप अप करें।",
    chatAgentTitle: "एआई पुस्तक सहायक",
    chatAgentDesc: "ब्रह्मांड की किसी भी पुस्तक को तुरंत प्राप्त करें और पढ़ें।",
    readerPage: "पृष्ठ",
    readingSessionActive: "पठन सत्र सक्रिय है",
    bookUnlockedSuccess: "पुस्तक सफलतापूर्वक अनलॉक हो गई!",
    languageSelect: "भाषा बदलें",
    logout: "लॉगआउट",
    allBooks: "सभी पुस्तकें",
    noBooksInFolder: "इस फ़ोल्डर में अभी कोई पुस्तक नहीं है। यहाँ पुस्तकें जोड़ें या एआई से कहें!",
    transactionHistory: "लेनदेन इतिहास",
    adminPanel: "एडमिन पैनल",
    libraryBtn: "लाइब्रेरी (Library)",
    categories: "श्रेणियां",
    cultureHeritage: "संस्कृति और विरासत",
    techScience: "प्रौद्योगिकी और विज्ञान",
    kidsEducation: "बच्चों की शिक्षा",
    mantrasSpirituality: "मंत्र और आध्यात्मिकता",
    literatureNovels: "साहित्य और उपन्यास",
    allCategories: "सभी श्रेणियां",
    downloadRate: "डाउनलोड / अनलॉक दर"
  },
  ta: {
    title: "ஆல் இன் ஒன் நூலகம்",
    subtitle: "உலகளாவிய அறிவு மையம்",
    loginWithGmail: "ஜிமெயில் மூலம் உள்நுழைக",
    chatPlaceholder: "ஏதேனும் புத்தகம், ஆசிரியர் அல்லது தலைப்பு பற்றி கேளுங்கள்...",
    searchBooks: "புத்தகங்களைத் தேடுங்கள்",
    folders: "கோப்புறைகள்",
    createFolder: "புதிய கோப்புறை",
    renameFolder: "பெயரை மாற்றுக",
    deleteFolder: "கோப்புறையை நீக்குக",
    addBook: "புத்தகத்தைச் சேர்",
    credits: "கிரெடிட்கள்",
    topup: "கிரெடிட்களை நிரப்புக",
    ratePerMin: "கிரெடிட்கள் / நிமிடம்",
    costToUnlock: "திறக்க வேண்டிய கிரெடிட்கள்",
    unlockBook: "புத்தகத்தைத் திறக்கவும்",
    startReading: "வாசிக்கத் தொடங்குங்கள்",
    stopReading: "வாசிப்பை நிறுத்துங்கள்",
    insufficientCredits: "போதிய கிரெடிட்கள் இல்லை! தயவுசெய்து நிரப்பவும்.",
    chatAgentTitle: "AI புத்தக உதவியாளர்",
    chatAgentDesc: "பிரபஞ்சத்தில் உள்ள எந்த புத்தகத்தையும் உடனடியாகப் பெற்று வாசியுங்கள்.",
    readerPage: "பக்கம்",
    readingSessionActive: "வாசிப்பு அமர்வு செயலில் உள்ளது",
    bookUnlockedSuccess: "புத்தகம் வெற்றிகரமாக திறக்கப்பட்டது!",
    languageSelect: "மொழியை மாற்றுக",
    logout: "வெளியேறு",
    allBooks: "அனைத்து புத்தகங்கள்",
    noBooksInFolder: "இந்த கோப்புறையில் இன்னும் புத்தகங்கள் இல்லை. புத்தகங்களை இங்கே இழுக்கவும் அல்லது AI ஐப் பயன்படுத்தவும்!",
    transactionHistory: "பரிவர்த்தனை வரலாறு",
    adminPanel: "நிர்வாகி குழு",
    libraryBtn: "நூலகம் (Library)",
    categories: "வகைகள்",
    cultureHeritage: "கலாச்சாரம் & பாரம்பரியம்",
    techScience: "தொழில்நுட்பம் & அறிவியல்",
    kidsEducation: "குழந்தைகள் & கல்வி",
    mantrasSpirituality: "மந்திரங்கள் & ஆன்மீகம்",
    literatureNovels: "இலக்கியம் & நாவல்கள்",
    allCategories: "அனைத்து வகைகள்",
    downloadRate: "பதிவிறக்கக் கட்டணம்"
  },
  kn: {
    title: "ಆಲ್ ಇನ್ ಒನ್ ಲೈಬ್ರರಿ",
    subtitle: "ಸಾರ್ವತ್ರಿಕ ಜ್ಞಾನ ಕೇಂದ್ರ",
    loginWithGmail: "ಜಿಮೇಲ್ ಮೂಲಕ ಲಾಗಿನ್ ಮಾಡಿ",
    chatPlaceholder: "ಯಾವುದೇ ಪುಸ್ತಕ, ಲೇಖಕ ಅಥವಾ ವಿಷಯದ ಬಗ್ಗೆ ಕೇಳಿ...",
    searchBooks: "ಪುಸ್ತಕಗಳನ್ನು ಹುಡುಕಿ",
    folders: "ಫೋಲ್ಡರ್‌ಗಳು",
    createFolder: "ಹೊಸ ಫೋಲ್ಡರ್",
    renameFolder: "ಹೆಸರು ಬದಲಾಯಿಸಿ",
    deleteFolder: "ಫೋಲ್ಡರ್ ಅಳಿಸಿ",
    addBook: "ಪುಸ್ತಕ ಸೇರಿಸಿ",
    credits: "ಕ್ರೆಡಿಟ್ಸ್",
    topup: "ಕ್ರೆಡಿಟ್ಸ್ ಟಾಪ್ ಅಪ್",
    ratePerMin: "ಕ್ರೆಡಿಟ್ಸ್ / ನಿಮಿಷಕ್ಕೆ",
    costToUnlock: "ಅನ್ಲಾಕ್ ಮಾಡಲು ಕ್ರೆಡಿಟ್ಸ್",
    unlockBook: "ಪುಸ್ತಕ ಅನ್ಲಾಕ್ ಮಾಡಿ",
    startReading: "ಓದಲು ಪ್ರಾರಂಭಿಸಿ",
    stopReading: "ಓದುವುದನ್ನು ನಿಲ್ಲಿಸಿ",
    insufficientCredits: "ಅಪರ್ಯಾಪ್ತ ಕ್ರೆಡಿಟ್‌ಗಳು! ದಯವಿಟ್ಟು ಟಾಪ್ ಅಪ್ ಮಾಡಿ.",
    chatAgentTitle: "AI ಪುಸ್ತಕ ಸಹಾಯಕ",
    chatAgentDesc: "ಬ್ರಹ್ಮಾಂಡದ ಯಾವುದೇ ಪುಸ್ತಕವನ್ನು ತಕ್ಷಣವೇ ಪಡೆದು ಓದಿ.",
    readerPage: "ಪುಟ",
    readingSessionActive: "ಓದುವ ಸೆಷನ್ ಸಕ್ರಿಯವಾಗಿದೆ",
    bookUnlockedSuccess: "ಪುಸ್ತಕ ಯಶಸ್ವಿಯಾಗಿ ಅನ್ಲಾಕ್ ಆಗಿದೆ!",
    languageSelect: "ಭಾಷೆ ಬದಲಾಯಿಸಿ",
    logout: "ಲಾಗ್ಔಟ್",
    allBooks: "ಎಲ್ಲಾ ಪುಸ್ತಕಗಳು",
    noBooksInFolder: "ಈ ಫೋಲ್ಡರ್‌ನಲ್ಲಿ ಇನ್ನು ಯಾವುದೇ ಪುಸ್ತಕಗಳಿಲ್ಲ. ಪುಸ್ತಕಗಳನ್ನು ಇಲ್ಲಿಗೆ ಸೇರಿಸಿ ಅಥವಾ AI ಗೆ ತಿಳಿಸಿ!",
    transactionHistory: "ವಹಿವಾಟು ಇತಿಹಾಸ",
    adminPanel: "ಅಡ್ಮಿನ್ ಪ್ಯಾನಲ್",
    libraryBtn: "ಲೈಬ್ರರಿ (Library)",
    categories: "ವರ್ಗಗಳು",
    cultureHeritage: "ಸಂಸ್ಕೃತಿ ಮತ್ತು ಪರಂಪರೆ",
    techScience: "ತಂತ್ರಜ್ಞಾನ ಮತ್ತು ವಿಜ್ಞಾನ",
    kidsEducation: "ಮಕ್ಕಳು ಮತ್ತು ಶಿಕ್ಷಣ",
    mantrasSpirituality: "ಮಂತ್ರಗಳು ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕತೆ",
    literatureNovels: "ಸಾಹಿತ್ಯ ಮತ್ತು ಕಾದಂಬರಿಗಳು",
    allCategories: "ಎಲ್ಲಾ ವರ್ಗಗಳು",
    downloadRate: "ಡೌನ್‌ಲೋಡ್ ದರ"
  },
  ml: {
    title: "ഓൾ ഇൻ വൺ ലൈബ്രറി",
    subtitle: "സർവത്ര ജ്ഞാന കേന്ദ്രം",
    loginWithGmail: "ജിമെയിൽ വഴി ലോഗിൻ ചെയ്യുക",
    chatPlaceholder: "ഏതെങ്കിലും പുസ്തകം, രചയിതാവ് അല്ലെങ്കിൽ വിഷയം ചോദിക്കുക...",
    searchBooks: "പുസ്തകങ്ങൾ തിരയുക",
    folders: "ഫോൾഡറുകൾ",
    createFolder: "പുതിയ ഫോൾഡർ",
    renameFolder: "പേര് മാറ്റുക",
    deleteFolder: "ഫോൾഡർ നീക്കം ചെയ്യുക",
    addBook: "പുസ്തകം ചേർക്കുക",
    credits: "ക്രെഡിറ്റുകൾ",
    topup: "ക്രെഡിറ്റുകൾ റീചാർജ് ചെയ്യുക",
    ratePerMin: "ക്രെഡിറ്റുകൾ / മിനിറ്റ്",
    costToUnlock: "അൺലോക്ക് ചെയ്യാൻ വേണ്ട ക്രെഡിറ്റുകൾ",
    unlockBook: "പുസ്തകം അൺലോക്ക് ചെയ്യുക",
    startReading: "വായിക്കാൻ തുടങ്ങുക",
    stopReading: "വായന നിർത്തുക",
    insufficientCredits: "മതിയായ ക്രെഡിറ്റുകൾ ഇല്ല! റീചാർജ് ചെയ്യുക.",
    chatAgentTitle: "AI പുസ്തക സഹായി",
    chatAgentDesc: "ലോകത്തിലെ ഏത് പുസ്തകവും തൽക്ഷണം കണ്ടെത്തുക.",
    readerPage: "പേജ്",
    readingSessionActive: "വായനാ സെഷൻ സജീവം",
    bookUnlockedSuccess: "പുസ്തകം വിജയകരമായി അൺലോക്ക് ചെയ്തു!",
    languageSelect: "ഭാഷ മാറ്റുക",
    logout: "ലോഗ്ഔട്ട്",
    allBooks: "എല്ലാ പുസ്തകങ്ങളും",
    noBooksInFolder: "ഈ ഫോൾഡറിൽ പുസ്തകങ്ങളൊന്നുമില്ല.",
    transactionHistory: "ഇടപാട് ചരിത്രം",
    adminPanel: "അഡ്മിൻ പാനൽ",
    libraryBtn: "ലൈബ്രറി (Library)",
    categories: "വിഭാഗങ്ങൾ",
    cultureHeritage: "സംസ്കാരവും പൈതൃകവും",
    techScience: "സാങ്കേതികവിദ്യയും ശാസ്ത്രവും",
    kidsEducation: "കുട്ടികളും വിദ്യാഭ്യാസവും",
    mantrasSpirituality: "മന്ത്രങ്ങളും ആത്മീയതയും",
    literatureNovels: "സാഹിത്യവും നോവലുകളും",
    allCategories: "എല്ലാ വിഭാഗങ്ങളും",
    downloadRate: "ഡൗൺലോഡ് നിരക്ക്"
  },
  mr: {
    title: "ऑल इन वन लायब्ररी",
    subtitle: "सार्वत्रिक ज्ञान केंद्र",
    loginWithGmail: "जीमेल द्वारे लॉगिन करा",
    chatPlaceholder: "कोणत्याही पुस्तकाबद्दल किंवा विषयाबद्दल विचारा...",
    searchBooks: "पुस्तके शोधा",
    folders: "फोल्डर",
    createFolder: "नवीन फोल्डर",
    renameFolder: "नाव बदला",
    deleteFolder: "फोल्डर हटवा",
    addBook: "पुस्तक जोडा",
    credits: "क्रेडिट्स",
    topup: "क्रेडिट्स टॉप अप करा",
    ratePerMin: "क्रेडिट्स / मिनिट",
    costToUnlock: "अनलॉक करण्यासाठी क्रेडिट्स",
    unlockBook: "पुस्तक अनलॉक करा",
    startReading: "वाचन सुरू करा",
    stopReading: "वाचन थांबवा",
    insufficientCredits: "अपुरे क्रेडिट्स! कृपया रिचार्ज करा.",
    chatAgentTitle: "एआय पुस्तक सहाय्यक",
    chatAgentDesc: "कोणतेही पुस्तक त्वरित मिळवा आणि वाचा.",
    readerPage: "पान",
    readingSessionActive: "वाचन सत्र सुरू आहे",
    bookUnlockedSuccess: "पुस्तक यशस्वीरित्या अनलॉक झाले!",
    languageSelect: "भाषा बदला",
    logout: "लॉगआउट",
    allBooks: "सर्व पुस्तके",
    noBooksInFolder: "या फोल्डरमध्ये अद्याप कोणतीही पुस्तके नाहीत.",
    transactionHistory: "व्यवहार इतिहास",
    adminPanel: "ॲडमिन पॅनेल",
    libraryBtn: "लायब्ररी (Library)",
    categories: "श्रेण्या",
    cultureHeritage: "संस्कृती आणि वारसा",
    techScience: "तंत्रज्ञान आणि विज्ञान",
    kidsEducation: "मुले आणि शिक्षण",
    mantrasSpirituality: "मंत्र आणि अध्यात्म",
    literatureNovels: "साहित्य आणि कादंबऱ्या",
    allCategories: "सर्व श्रेण्या",
    downloadRate: "डाउनलोड दर"
  },
  bn: {
    title: "অল ইন ওয়ান লাইব্রেরি",
    subtitle: "সর্বজনীন জ্ঞান কেন্দ্র",
    loginWithGmail: "জিবনে লগইন করুন",
    chatPlaceholder: "যেকোনো বই বা বিষয় সম্পর্কে জিজ্ঞাসা করুন...",
    searchBooks: "বই খুঁজুন",
    folders: "ফোল্ডার",
    createFolder: "নতুন ফোল্ডার",
    renameFolder: "নাম পরিবর্তন",
    deleteFolder: "ফোল্ডার মুছুন",
    addBook: "বই যোগ করুন",
    credits: "ক্রেডিট",
    topup: "ক্রেডিট রিচার্জ করুন",
    ratePerMin: "ক্রেডিট / মিনিট",
    costToUnlock: "আনলক করার জন্য ক্রেডিট",
    unlockBook: "বই আনলক করুন",
    startReading: "পড়া শুরু করুন",
    stopReading: "পড়া বন্ধ করুন",
    insufficientCredits: "পর্যাপ্ত ক্রেডিট নেই! রিচার্জ করুন।",
    chatAgentTitle: "এআই বই সহকারী",
    chatAgentDesc: "যেকোনো বই তাৎক্ষণিকভাবে আনুন এবং পড়ুন।",
    readerPage: "পৃষ্ঠা",
    readingSessionActive: "পঠন সেশন সক্রিয়",
    bookUnlockedSuccess: "বই সফলভাবে আনলক হয়েছে!",
    languageSelect: "ভাষা পরিবর্তন করুন",
    logout: "লগআউট",
    allBooks: "সব বই",
    noBooksInFolder: "এই ফোল্ডারে এখনো কোনো বই নেই।",
    transactionHistory: "লেনদেনের ইতিহাস",
    adminPanel: "এডমিন প্যানেল",
    libraryBtn: "লাইব্রেরি (Library)",
    categories: "বিভাগসমূহ",
    cultureHeritage: "সংস্কৃতি ও ঐতিহ্য",
    techScience: "প্রযুক্তি ও বিজ্ঞান",
    kidsEducation: "শিশু ও শিক্ষা",
    mantrasSpirituality: "মন্ত্র ও আধ্যাত্মিকতা",
    literatureNovels: "সাহিত্য ও উপন্যাস",
    allCategories: "সমস্ত বিভাগ",
    downloadRate: "ডাউনলোড হার"
  },
  gu: {
    title: "ઓલ ઇન વન લાઈબ્રેરી",
    subtitle: "સાર્વત્રિક જ્ઞાન કેન્દ્ર",
    loginWithGmail: "જીમેલ સાથે લોગિન કરો",
    chatPlaceholder: "કોઈપણ પુસ્તક અથવા વિષય વિશે પૂછો...",
    searchBooks: "પુસ્તકો શોધો",
    folders: "ફોલ્ડર્સ",
    createFolder: "નવું ફોલ્ડર",
    renameFolder: "નામ બદલો",
    deleteFolder: "ફોલ્ડર કાઢી નાખો",
    addBook: "પુસ્તક ઉમેરો",
    credits: "ક્રેડિટ્સ",
    topup: "ક્રેડિટ્સ ટોપ અપ કરો",
    ratePerMin: "ક્રેડિટ્સ / મિનિટ",
    costToUnlock: "અનલોક કરવા માટે ક્રેડિટ્સ",
    unlockBook: "પુસ્તક અનલોક કરો",
    startReading: "વાંચવાનું શરૂ કરો",
    stopReading: "વાંચવાનું બંધ કરો",
    insufficientCredits: "અપૂરતી ક્રેડિટ્સ! કૃપા કરીને રિચાર્જ કરો.",
    chatAgentTitle: "એઆઈ પુસ્તક સહાયક",
    chatAgentDesc: "કોઈપણ પુસ્તક તરત મેળવો અને વાંચો.",
    readerPage: "પૃષ્ઠ",
    readingSessionActive: "વાંચન સત્ર સક્રિય",
    bookUnlockedSuccess: "પુસ્તક સફળતાપૂર્વક અનલોક થયું!",
    languageSelect: "ભાષા બદલો",
    logout: "લોગઆઉટ",
    allBooks: "બધા પુસ્તકો",
    noBooksInFolder: "આ ફોલ્ડરમાં હજુ સુધી કોઈ પુસ્તકો નથી.",
    transactionHistory: "વ્યવહાર ઇતિહાસ",
    adminPanel: "એડમિન પેનલ",
    libraryBtn: "લાઈબ્રેરી (Library)",
    categories: "શ્રેણીઓ",
    cultureHeritage: "સંસ્કૃતિ અને વારસો",
    techScience: "ટેકનોલોજી અને વિજ્ઞાન",
    kidsEducation: "બાળકો અને શિક્ષણ",
    mantrasSpirituality: "મંત્રો અને આધ્યાત્મિકતા",
    literatureNovels: "સાહિત્ય અને નવલકથાઓ",
    allCategories: "બધી શ્રેણીઓ",
    downloadRate: "ડાઉનલોડ દર"
  },
  pa: {
    title: "ਆਲ ਇਨ ਵਨ ਲਾਇਬ੍ਰੇਰੀ",
    subtitle: "ਸਰਵਵਿਆਪੀ ਗਿਆਨ ਕੇਂਦਰ",
    loginWithGmail: "ਜੀਮੇਲ ਨਾਲ ਲੌਗਇਨ ਕਰੋ",
    chatPlaceholder: "ਕਿਸੇ ਵੀ ਕਿਤਾਬ ਬਾਰੇ ਪੁੱਛੋ...",
    searchBooks: "ਕਿਤਾਬਾਂ ਖੋਜੋ",
    folders: "ਫ਼ੋਲਡਰ",
    createFolder: "ਨਵਾਂ ਫ਼ੋਲਡਰ",
    renameFolder: "ਨਾਮ ਬਦਲੋ",
    deleteFolder: "ਫ਼ੋਲਡਰ ਹਟਾਓ",
    addBook: "ਕਿਤਾਬ ਜੋੜੋ",
    credits: "ਕ੍ਰੈਡਿਟ",
    topup: "ਕ੍ਰੈਡਿਟ ਰੀਚਾਰਜ ਕਰੋ",
    ratePerMin: "ਕ੍ਰੈਡਿਟ / ਮਿੰਟ",
    costToUnlock: "ਅਨਲੌਕ ਕਰਨ ਲਈ ਕ੍ਰੈਡਿਟ",
    unlockBook: "ਕਿਤਾਬ ਅਨਲੌਕ ਕਰੋ",
    startReading: "ਪੜ੍ਹਨਾ ਸ਼ੁਰੂ ਕਰੋ",
    stopReading: "ਪੜ੍ਹਨਾ ਬੰਦ ਕਰੋ",
    insufficientCredits: "ਅਧੂਰੇ ਕ੍ਰੈਡਿਟ! ਰੀਚਾਰਜ ਕਰੋ।",
    chatAgentTitle: "ਏਆਈ ਕਿਤਾਬ ਸਹਾਇਕ",
    chatAgentDesc: "ਕੋਈ ਵੀ ਕਿਤਾਬ ਤੁਰੰਤ ਪ੍ਰਾਪਤ ਕਰੋ।",
    readerPage: "ਸਫ਼ਾ",
    readingSessionActive: "ਪੜ੍ਹਨ ਦਾ ਸੈਸ਼ਨ ਚੱਲ ਰਿਹਾ ਹੈ",
    bookUnlockedSuccess: "ਕਿਤਾਬ ਅਨਲੌਕ ਹੋ ਗਈ!",
    languageSelect: "ਭਾਸ਼ਾ ਬਦਲੋ",
    logout: "ਲੌਗਆਉਟ",
    allBooks: "ਸਾਰੀਆਂ ਕਿਤਾਬਾਂ",
    noBooksInFolder: "ਇਸ ਫ਼ੋਲਡਰ ਵਿੱਚ ਅਜੇ ਕੋਈ ਕਿਤਾਬ ਨਹੀਂ ਹੈ।",
    transactionHistory: "ਲੈਣ-ਦੇਣ ਦਾ ਇਤਿਹਾਸ",
    adminPanel: "ਐਡਮਿਨ ਪੈਨਲ",
    libraryBtn: "ਲਾਇਬ੍ਰੇਰੀ (Library)",
    categories: "ਸ਼੍ਰੇਣੀਆਂ",
    cultureHeritage: "ਸੱਭਿਆਚਾਰ ਅਤੇ ਵਿਰਾਸਤ",
    techScience: "ਤਕਨਾਲੋਜੀ ਅਤੇ ਵਿਗਿਆਨ",
    kidsEducation: "ਬੱਚੇ ਅਤੇ ਸਿੱਖਿਆ",
    mantrasSpirituality: "ਮੰਤਰ ਅਤੇ ਅਧਿਆਤਮਿਕਤਾ",
    literatureNovels: "ਸਾਹਿਤ ਅਤੇ ਨਾਵਲ",
    allCategories: "ਸਾਰੀਆਂ ਸ਼੍ਰੇਣੀਆਂ",
    downloadRate: "ਡਾਊਨਲੋਡ ਦਰ"
  },
  or: {
    title: "ଅଲ୍ ଇନ୍ ୱାନ୍ ଲାଇବ୍ରେରୀ",
    subtitle: "ସାର୍ବଜନୀନ ଜ୍ଞାନ କେନ୍ଦ୍ର",
    loginWithGmail: "ଜିମେଲ୍ ସହିତ ଲଗ୍ଇନ୍ କରନ୍ତୁ",
    chatPlaceholder: "ଯେକୌଣସି ପୁସ୍ତକ ବିଷୟରେ ପଚାରନ୍ତୁ...",
    searchBooks: "ପୁସ୍ତକ ସନ୍ଧାନ କରନ୍ତୁ",
    folders: "ଫୋଲ୍ଡର",
    createFolder: "ନୂତନ ଫୋଲ୍ଡର",
    renameFolder: "ନାମ ପରିବର୍ତ୍ତନ",
    deleteFolder: "ଫୋଲ୍ଡର ହଟାନ୍ତୁ",
    addBook: "ପୁସ୍ତକ ଯୋଡନ୍ତୁ",
    credits: "କ୍ରେଡିଟ୍",
    topup: "କ୍ରେଡିଟ୍ ରିଚାର୍ଜ କରନ୍ତୁ",
    ratePerMin: "କ୍ରେଡିଟ୍ / ମିନିଟ୍",
    costToUnlock: "ଅନଲକ୍ ପାଇଁ କ୍ରେଡିଟ୍",
    unlockBook: "ପୁସ୍ତକ ଅନଲକ୍ କରନ୍ତୁ",
    startReading: "ପଢିବା ଆରମ୍ଭ କରନ୍ତୁ",
    stopReading: "ପଢିବା ବନ୍ଦ କରନ୍ତୁ",
    insufficientCredits: "ପର୍ଯ୍ୟାପ୍ତ କ୍ରେଡିଟ୍ ନାହିଁ! ରିଚାର୍ଜ କରନ୍ତୁ।",
    chatAgentTitle: "AI ପୁସ୍ତକ ସହାୟକ",
    chatAgentDesc: "ଯେକୌଣସି ପୁସ୍ତକ ତୁରନ୍ତ ଆଣନ୍ତୁ।",
    readerPage: "ପୃଷ୍ଠା",
    readingSessionActive: "ପଠନ ସେସନ୍ ସକ୍ରିୟ",
    bookUnlockedSuccess: "ପୁସ୍ତକ ସଫଳତାର ସହିତ ଅନଲକ୍ ହୋଇଛି!",
    languageSelect: "ଭାଷା ପରିବର୍ତ୍ତନ କରନ୍ତୁ",
    logout: "ଲଗ୍ଆଉଟ୍",
    allBooks: "ସମସ୍ତ ପୁସ୍ତକ",
    noBooksInFolder: "ଏହି ଫୋଲ୍ଡରରେ କୌଣସି ପୁସ୍ତକ ନାହିଁ।",
    transactionHistory: "କାରବାର ଇତିହାସ",
    adminPanel: "ଆଡମିନ୍ ପ୍ୟାନେଲ୍",
    libraryBtn: "ଲାଇବ୍ରେରୀ (Library)",
    categories: "ବିଭାଗଗୁଡିକ",
    cultureHeritage: "ସଂସ୍କୃତି ଓ ଐତିହ୍ୟ",
    techScience: "ପ୍ରଯୁକ୍ତିବିଦ୍ୟା ଓ ବିଜ୍ଞାନ",
    kidsEducation: "ପିଲାମାନେ ଓ ଶିକ୍ଷା",
    mantrasSpirituality: "ମନ୍ତ୍ର ଓ ଆଧ୍ୟାତ୍ମିକତା",
    literatureNovels: "ସାହିତ୍ୟ ଓ ଉପନ୍ୟାସ",
    allCategories: "ସମସ୍ତ ବିଭାଗ",
    downloadRate: "ଡାଉନଲୋଡ୍ ଦର"
  },
  es: {
    title: "Biblioteca Todo en Uno",
    subtitle: "Centro de Conocimiento Universal",
    loginWithGmail: "Iniciar sesión con Gmail",
    chatPlaceholder: "Pregunta sobre cualquier libro, autor o tema...",
    searchBooks: "Buscar Libros",
    folders: "Carpetas",
    createFolder: "Nueva Carpeta",
    renameFolder: "Renombrar Carpeta",
    deleteFolder: "Eliminar Carpeta",
    addBook: "Agregar Libro",
    credits: "Créditos",
    topup: "Recargar Créditos",
    ratePerMin: "créditos / min",
    costToUnlock: "Créditos para desbloquear",
    unlockBook: "Desbloquear Libro",
    startReading: "Iniciar Lectura",
    stopReading: "Detener Lectura",
    insufficientCredits: "¡Créditos insuficientes! Por favor recargue.",
    chatAgentTitle: "Asistente de Libro IA",
    chatAgentDesc: "Busca y lee instantáneamente cualquier libro en el universo.",
    readerPage: "Página",
    readingSessionActive: "Sesión de lectura activa",
    bookUnlockedSuccess: "¡Libro desbloqueado con éxito!",
    languageSelect: "Cambiar Idioma",
    logout: "Cerrar sesión",
    allBooks: "Todos los libros",
    noBooksInFolder: "No hay libros en esta carpeta aún. ¡Arrastra libros aquí o usa la IA!",
    transactionHistory: "Historial de transacciones",
    adminPanel: "Panel de Administración",
    libraryBtn: "Biblioteca (Library)",
    categories: "Categorías",
    cultureHeritage: "Cultura y Patrimonio",
    techScience: "Tecnología y Ciencia",
    kidsEducation: "Niños y Educación",
    mantrasSpirituality: "Mantras y Espiritualidad",
    literatureNovels: "Literatura y Novelas",
    allCategories: "Todas las categorías",
    downloadRate: "Tasa de descarga / desbloqueo"
  }
};
