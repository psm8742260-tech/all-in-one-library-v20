import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, MessageSquare, BookOpen, Coins, Globe, LogOut, 
  Send, Sparkles, Loader2, FolderPlus, Compass, ArrowRight,
  Bookmark, FolderHeart, Check, ShoppingCart, Lock,
  HelpCircle, ChevronRight, BookOpenCheck, AlertCircle, Grid, Filter,
  Download, QrCode, Mic, Film, Volume2, VolumeX, Image, Video, Paperclip, Plus, Trash2, RefreshCw
} from 'lucide-react';
import { 
  User, Book, Folder, CreditTransaction, ChatMessage, LanguageCode, TRANSLATIONS, WriterApplication, RegisteredTree
} from '../types';
import FolderPanel from './FolderPanel';
import PricingPanel from './PricingPanel';
import AdminPanel from './AdminPanel';
import LibraryModal, { CATEGORIES, ALL_INDIA_LANGUAGES } from './LibraryModal';
import WriterRegistrationModal from './WriterRegistrationModal';
import PaymentModal from './PaymentModal';
// @ts-ignore
import appLogoImg from '../assets/images/app_logo_icon_1787974156637.jpg';

interface DashboardProps {
  user: User;
  books: Book[];
  folders: Folder[];
  transactions: CreditTransaction[];
  onLogout: () => void;
  onUpdateUserCredits: (newCredits: number) => void;
  onAddTransaction: (amount: number, description: string, type: 'unlock' | 'session' | 'topup' | 'bonus') => void;
  onUpdateBooks: (updatedBooks: Book[]) => void;
  onUpdateFolders: (updatedFolders: Folder[]) => void;
  onAddBook: (newBook: Book) => void;
  onDeleteBook: (bookId: string) => void;
  writerApplications: WriterApplication[];
  onRegisterWriter: (app: WriterApplication) => void;
  onApproveWriterApplication?: (app: WriterApplication) => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenReader: (book: Book) => void;
  registeredTrees?: RegisteredTree[];
  onRegisterTree?: (tree: RegisteredTree) => void;
  onApproveTree?: (treeId: string) => void;
  onRejectTree?: (treeId: string) => void;
  onDeleteTree?: (treeId: string) => void;
}

export default function Dashboard({
  user,
  books,
  folders,
  transactions,
  onLogout,
  onUpdateUserCredits,
  onAddTransaction,
  onUpdateBooks,
  onUpdateFolders,
  onAddBook,
  onDeleteBook,
  writerApplications,
  onRegisterWriter,
  onApproveWriterApplication,
  currentLanguage,
  onLanguageChange,
  onOpenReader,
  registeredTrees = [],
  onRegisterTree,
  onApproveTree,
  onRejectTree,
  onDeleteTree
}: DashboardProps) {
  const isAdmin = user.email.toLowerCase() === 'psm8742260@gmail.com' || user.email.toLowerCase() === 'sim_8466062260@sim-auth.library';
  const [activeTab, setActiveTab] = useState<'chat' | 'shelf'>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showWriterModal, setShowWriterModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [fetchingBookId, setFetchingBookId] = useState<string | null>(null);

  // Selected book for details modal
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Payment Modal state for UPI QR Scanner
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalBook, setPaymentModalBook] = useState<Book | null>(null);
  const [paymentModalMode, setPaymentModalMode] = useState<'read' | 'download'>('read');

  // Media attachments in Chat Console
  const [chatImageAttachment, setChatImageAttachment] = useState<string | null>(null);
  const [chatVideoAttachment, setChatVideoAttachment] = useState<string | null>(null);
  const [chatAudioAttachment, setChatAudioAttachment] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  // Universal Audio/TTS Player State for any book in Library
  const [currentlySpeakingBookId, setCurrentlySpeakingBookId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const audioLimitTimerRef = useRef<any>(null);
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const t = TRANSLATIONS[currentLanguage];

  // Trees / Green Library Modal State
  const [showTreesModal, setShowTreesModal] = useState(false);
  const [treeFormName, setTreeFormName] = useState('');
  const [treeFormPlanter, setTreeFormPlanter] = useState('');
  const [treeFormLocation, setTreeFormLocation] = useState('');
  const [treeFormImage, setTreeFormImage] = useState<string | null>(null);
  const [isIdentifyingTree, setIsIdentifyingTree] = useState(false);
  const [identifiedTreeDetails, setIdentifiedTreeDetails] = useState<any>(null);
  const [selectedTreeDetail, setSelectedTreeDetail] = useState<RegisteredTree | null>(null);
  const treeImageInputRef = useRef<HTMLInputElement | null>(null);

  // Stop any ongoing speech or audio
  const handleStopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    if (audioLimitTimerRef.current) {
      clearTimeout(audioLimitTimerRef.current);
      audioLimitTimerRef.current = null;
    }
    setCurrentlySpeakingBookId(null);
  };

  const handleIdentifyTree = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Img = reader.result as string;
      setTreeFormImage(base64Img);
      setIsIdentifyingTree(true);
      setIdentifiedTreeDetails(null);

      try {
        const res = await fetch('/api/identify-plant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ image: base64Img })
        });

        if (!res.ok) {
          throw new Error('Failed to identify plant');
        }

        const data = await res.json();
        setIdentifiedTreeDetails(data);
        setTreeFormName(data.treeName || '');
      } catch (err) {
        console.error('Error identifying plant:', err);
        alert('మొక్కను గుర్తించడంలో లోపం సంభవించింది. దయచేసి మళ్లీ ప్రయత్నించండి.');
      } finally {
        setIsIdentifyingTree(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRegisterTreeSubmit = () => {
    if (!treeFormName.trim() || !treeFormPlanter.trim() || !treeFormImage) {
      alert('దయచేసి మొక్క పేరు, నాటిన వారి పేరు మరియు ఫోటో తప్పనిసరిగా సమర్పించండి.');
      return;
    }

    const newTree: RegisteredTree = {
      id: `tree-${Date.now()}`,
      treeName: treeFormName.trim(),
      botanicalName: identifiedTreeDetails?.botanicalName || 'Botanical Specimen',
      sanskritNames: identifiedTreeDetails?.sanskritNames || [],
      teluguNames: identifiedTreeDetails?.teluguNames || [treeFormName.trim()],
      hindiNames: identifiedTreeDetails?.hindiNames || [],
      tamilNames: identifiedTreeDetails?.tamilNames || [],
      kannadaNames: identifiedTreeDetails?.kannadaNames || [],
      englishNames: identifiedTreeDetails?.englishNames || [],
      otherNames: identifiedTreeDetails?.otherNames || [],
      description: identifiedTreeDetails?.description || 'స్వదేశీ వృక్ష సంపద',
      medicinalUses: identifiedTreeDetails?.medicinalUses || 'ఆయుర్వేద ఔషధ గుణాలు కలవు',
      planterName: treeFormPlanter.trim(),
      photoUrl: treeFormImage,
      location: treeFormLocation.trim() || 'భారతదేశం',
      datePlanted: new Date().toLocaleDateString('te-IN'),
      status: 'pending',
      timestamp: new Date().toLocaleString()
    };

    onRegisterTree?.(newTree);

    // Reset Form
    setTreeFormName('');
    setTreeFormPlanter('');
    setTreeFormLocation('');
    setTreeFormImage(null);
    setIdentifiedTreeDetails(null);
    alert('వృక్ష రిజిస్ట్రేషన్ దరఖాస్తు విజయవంతంగా సమర్పించబడింది! అడ్మిన్ ఆమోదం పొందిన తర్వాత గ్యాలరీలో కనిపిస్తుంది.');
  };

  // Universal Listen / Speaker function for any book in the library
  const handlePlayBookAudio = (book: Book, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // If already speaking this book, toggle off
    if (currentlySpeakingBookId === book.id) {
      handleStopAudio();
      return;
    }

    handleStopAudio();

    // Check if user has unlocked the book or is admin
    const isUnlocked = book.costToUnlock === 0 || book.isUnlocked || isAdmin;
    const savedLimit = localStorage.getItem('library_free_listening_seconds');
    const limitSec = savedLimit ? Number(savedLimit) : 60; // default 60 seconds (1 minute)

    if (!isUnlocked) {
      audioLimitTimerRef.current = setTimeout(() => {
        handleStopAudio();
        alert(`🔊 ఉచిత వినికిడి సమయం (${limitSec} సెకన్లు) ముగిసింది! పూర్తి పుస్తకాన్ని వినడానికి లేదా చదవడానికి అన్‌లాక్ చేయండి.`);
      }, limitSec * 1000);
    }

    // 1. If book has a custom audio recording / file URL
    if (book.audioUrl) {
      setCurrentlySpeakingBookId(book.id);
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio(book.audioUrl);
      } else {
        audioPlayerRef.current.src = book.audioUrl;
      }
      audioPlayerRef.current.play().catch(() => {
        // Fallback to speech synthesis if audio play fails
        speakBookText(book);
      });
      audioPlayerRef.current.onended = () => {
        setCurrentlySpeakingBookId(null);
        if (audioLimitTimerRef.current) {
          clearTimeout(audioLimitTimerRef.current);
          audioLimitTimerRef.current = null;
        }
      };
      return;
    }

    // 2. Universal Browser Speech Synthesis for any text book
    speakBookText(book);
  };

  const speakBookText = (book: Book) => {
    if (!('speechSynthesis' in window)) {
      alert('మీ బ్రౌజర్‌లో ఆడియో స్పీచ్ సదుపాయం అందుబాటులో లేదు.');
      return;
    }

    const textToSpeak = `${book.title}. రచయిత: ${book.author}. ${book.description}. ${
      book.chapters && book.chapters.length > 0 ? book.chapters[0].content : ''
    }`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Detect language code
    if (currentLanguage === 'te') utterance.lang = 'te-IN';
    else if (currentLanguage === 'hi') utterance.lang = 'hi-IN';
    else if (currentLanguage === 'ta') utterance.lang = 'ta-IN';
    else utterance.lang = 'en-US';

    utterance.onend = () => {
      setCurrentlySpeakingBookId(null);
    };
    utterance.onerror = () => {
      setCurrentlySpeakingBookId(null);
    };

    setCurrentlySpeakingBookId(book.id);
    window.speechSynthesis.speak(utterance);
  };

  // Open Sample Reader with filtered chapters
  const handleOpenSampleReader = (book: Book, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const isEnabled = localStorage.getItem('library_is_sample_enabled') !== 'false';
    if (!isEnabled) {
      alert('క్షమించండి! శాంపిల్ ఫీచర్ ప్రస్తుతం నిలిపివేయబడింది.');
      return;
    }

    const limit = Number(localStorage.getItem('library_sample_pages_count') || '5');

    if (!book.chapters || book.chapters.length === 0) {
      onOpenReader({ ...book, isUnlocked: true, isSampleMode: true });
      return;
    }

    const total = book.chapters.length;
    let selectedChapters: any[] = [];

    if (total <= limit) {
      selectedChapters = [...book.chapters];
    } else {
      // 1. First page (with illustration)
      selectedChapters.push(book.chapters[0]);

      if (limit > 1) {
        // Calculate middle pages count
        const middleCount = limit - 2;
        if (middleCount > 0 && total > 2) {
          // Find evenly spaced indices between 1 and total - 2
          const step = (total - 2) / (middleCount + 1);
          for (let i = 1; i <= middleCount; i++) {
            const idx = Math.round(1 + i * step);
            if (idx < total - 1 && !selectedChapters.some(ch => ch.id === book.chapters[idx].id)) {
              selectedChapters.push(book.chapters[idx]);
            }
          }
        }

        // Fill remaining if needed to match limit exactly
        while (selectedChapters.length < limit - 1 && selectedChapters.length < total - 1) {
          for (let i = 1; i < total - 1; i++) {
            if (!selectedChapters.some(ch => ch.id === book.chapters[i].id)) {
              selectedChapters.push(book.chapters[i]);
              break;
            }
          }
        }

        // 3. Last page
        if (!selectedChapters.some(ch => ch.id === book.chapters[total - 1].id)) {
          selectedChapters.push(book.chapters[total - 1]);
        }
      }
    }

    // Sort chapters back to their original sequence to maintain book flow
    const orderedChapters = book.chapters.filter(ch => selectedChapters.some(sch => sch.id === ch.id));

    onOpenReader({
      ...book,
      isUnlocked: true,
      isSampleMode: true,
      chapters: orderedChapters
    });
  };

  // Handle Chat File Attachment Uploads
  const handleChatImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setChatImageAttachment(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleChatVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setChatVideoAttachment(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleChatAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setChatAudioAttachment(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleIdentifyWithAttachment = (attachment: string) => {
    setTreeFormImage(attachment);
    setShowTreesModal(true);
    setIsIdentifyingTree(true);
    setIdentifiedTreeDetails(null);
    
    fetch('/api/identify-plant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: attachment })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to identify plant');
      return res.json();
    })
    .then(data => {
      setIdentifiedTreeDetails(data);
      setTreeFormName(data.treeName || '');
    })
    .catch(err => {
      console.error('Error identifying plant:', err);
      alert('మొక్కను గుర్తించడంలో లోపం సంభవించింది.');
    })
    .finally(() => {
      setIsIdentifyingTree(false);
    });
  };

  // Retrieve admin pricing settings
  const readPriceINR = Number(localStorage.getItem('library_read_price')) || 10;
  const downloadPriceINR = Number(localStorage.getItem('library_download_price')) || 29;
  const adminUpiId = localStorage.getItem('library_admin_upi') || 'psm8742260@upi';

  // Handle Download Book as a clean formatted document file
  const handleDownloadBook = (book: Book) => {
    const chaptersText = book.chapters && book.chapters.length > 0
      ? book.chapters.map((ch, i) => `\n========================================\nCHAPTER ${i + 1}: ${ch.title}\n========================================\n\n${ch.content}\n`).join('\n')
      : `\n${book.description}\n`;

    const fullBookContent = `======================================================
${book.title.toUpperCase()}
Author: ${book.author}
Category: ${book.category || 'General'}
All In One Library Official Edition
======================================================

SYNOPSIS:
${book.description}

${chaptersText}

======================================================
Downloaded from All In One Library Hub
======================================================`;

    const blob = new Blob([fullBookContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}_Book.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenPayment = (book: Book, mode: 'read' | 'download') => {
    setPaymentModalBook(book);
    setPaymentModalMode(mode);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (book: Book, mode: 'read' | 'download') => {
    // Unlock book in catalog
    const updated = books.map(b => b.id === book.id ? { ...b, isUnlocked: true } : b);
    onUpdateBooks(updated);

    onAddTransaction(
      mode === 'read' ? -readPriceINR : -downloadPriceINR,
      `UPI Payment for "${book.title}" (${mode === 'read' ? 'Reading Pass' : 'PDF Download'})`,
      'unlock'
    );

    if (mode === 'read') {
      onOpenReader({ ...book, isUnlocked: true });
    } else {
      handleDownloadBook(book);
    }
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  // Suggested Prompts based on selected language
  const suggestedPrompts = [
    { 
      label: currentLanguage === 'te' ? "నా పంచతంత్ర కథల పుస్తకం ఇవ్వండి" : currentLanguage === 'hi' ? "पंचतंत्र की कहानियाँ दें" : currentLanguage === 'ta' ? "பஞ்சதந்திர கதைகள் புத்தகம்" : currentLanguage === 'kn' ? "ಪಂಚತಂತ್ರ ಕಥೆಗಳ ಪುಸ್ತಕ" : "Give me Panchatantra Stories book", 
      value: "Panchatantra Stories" 
    },
    { 
      label: currentLanguage === 'te' ? "భగవద్గీత శ్లోకాలు & తాత్పర్యం" : currentLanguage === 'hi' ? "भगवद्गीता श्लोक और अर्थ" : currentLanguage === 'ta' ? "பகவத் கீதை ஸ்லோகங்கள்" : currentLanguage === 'kn' ? "ಭಗವದ್ಗೀತೆ ಶ್ಲೋಕಗಳು" : "Bhagavad Gita slokas & meaning", 
      value: "Bhagavad Gita" 
    },
    { 
      label: currentLanguage === 'te' ? "The Art of War పుస్తకం" : currentLanguage === 'hi' ? "द आर्ट ऑफ़ वॉर पुस्तक" : currentLanguage === 'ta' ? "தி ஆர்ட் ஆஃப் வார் புத்தகம்" : currentLanguage === 'kn' ? "ದಿ ಆರ್ಟ್ ಆಫ್ ವಾರ್ ಪುಸ್ತಕ" : "The Art of War classic book", 
      value: "The Art of War by Sun Tzu" 
    },
    { 
      label: currentLanguage === 'te' ? "సైన్స్ & అంతరిక్ష పుస్తకాలు" : currentLanguage === 'hi' ? "विज्ञान और अंतरिक्ष पुस्तकें" : currentLanguage === 'ta' ? "அறிவியல் மற்றும் விண்வெளி" : currentLanguage === 'kn' ? "ವಿಜ್ಞಾನ ಮತ್ತು ಬಾಹ್ಯಕಾಶ" : "Science & Space Books", 
      value: "Science & Space Exploration" 
    }
  ];

  // Handle send message to Gemini Assistant
  const handleSendMessage = async (textToSend: string) => {
    if ((!textToSend.trim() && !chatImageAttachment && !chatVideoAttachment && !chatAudioAttachment) || chatLoading) return;

    const currentImg = chatImageAttachment;
    const currentVid = chatVideoAttachment;
    const currentAud = chatAudioAttachment;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim() || (currentImg ? 'ఫోటో అప్‌లోడ్ చేయబడింది' : currentVid ? 'వీడియో కథ అప్‌లోడ్ చేయబడింది' : currentAud ? 'వాయిస్ కథ అప్‌లోడ్ చేయబడింది' : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: currentImg || undefined,
      videoUrl: currentVid || undefined,
      audioUrl: currentAud || undefined
    };

    // If media was attached, automatically register to writer applications for Admin review & sync
    if (currentImg || currentVid || currentAud) {
      const autoWriterApp: WriterApplication = {
        id: `chat-upload-${Date.now()}`,
        name: user.name || 'Chat Contributor',
        email: user.email || 'user@library.in',
        bio: `చాట్ కన్సోల్ ద్వారా సమర్పించబడిన మీడియా రచన: ${textToSend || 'కథనం'}`,
        bookTitle: textToSend.trim() ? (textToSend.slice(0, 40) + '...') : (currentAud ? 'చాట్ వాయిస్ కథనం' : currentVid ? 'చాట్ వీడియో కథనం' : 'చిత్ర కథనం'),
        contentType: currentAud ? 'audio' : currentVid ? 'video' : 'text',
        coverImage: currentImg || undefined,
        audioUrl: currentAud || undefined,
        videoUrl: currentVid || undefined,
        storyText: textToSend.trim() || undefined,
        category: 'Chat Submissions',
        status: 'pending',
        timestamp: new Date().toLocaleString()
      };
      onRegisterWriter(autoWriterApp);
    }

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setChatImageAttachment(null);
    setChatVideoAttachment(null);
    setChatAudioAttachment(null);
    setChatLoading(true);

    try {
      let deepseekSettings = null;
      try {
        const savedDs = localStorage.getItem('deepseek_settings');
        if (savedDs) {
          deepseekSettings = JSON.parse(savedDs);
        }
      } catch (e) {
        console.error('Failed to parse deepseek_settings', e);
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          availableBooks: books.map(b => ({
            id: b.id,
            title: b.title,
            author: b.author,
            category: b.category,
            description: b.description,
            costToUnlock: b.costToUnlock,
            costPerMinute: b.costPerMinute
          })),
          currentLanguage,
          deepseekSettings
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI Librarian');
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedBooks: data.recommendedBooks
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Sorry, I encountered an error. Please try again. Error details: ${error.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Triggered when user wants to dynamically fetch a book recommended by Gemini
  const handleFetchBookWithAI = async (provisionalBook: Book) => {
    if (fetchingBookId) return;

    // Cost checks
    if (user.credits < provisionalBook.costToUnlock) {
      alert(t.insufficientCredits);
      return;
    }

    setFetchingBookId(provisionalBook.id);

    try {
      let deepseekSettings = null;
      try {
        const savedDs = localStorage.getItem('deepseek_settings');
        if (savedDs) {
          deepseekSettings = JSON.parse(savedDs);
        }
      } catch (e) {
        console.error('Failed to parse deepseek_settings', e);
      }

      const response = await fetch('/api/generate-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: provisionalBook.title,
          author: provisionalBook.author,
          currentLanguage,
          deepseekSettings
        })
      });

      if (!response.ok) {
        throw new Error('Failed to dynamically fetch and build book');
      }

      const generatedData = await response.json();

      // Deduct Credits & Register Transaction
      const deductCost = provisionalBook.costToUnlock;
      const finalCredits = user.credits - deductCost;
      onUpdateUserCredits(finalCredits);
      onAddTransaction(-deductCost, `AI Generation & Acquisition of "${provisionalBook.title}"`, 'unlock');

      // Add book to catalog with active folder if folder is selected
      const genTitle = generatedData.title || provisionalBook.title || '';
      const genDesc = generatedData.description || provisionalBook.description || '';
      const genCat = generatedData.category || provisionalBook.category || '';
      const isPalmBook = genTitle.toLowerCase().includes('తాళపత్ర') || genDesc.toLowerCase().includes('తాళపత్ర') || genCat.toLowerCase().includes('తాళపత్ర') ||
                         genTitle.toLowerCase().includes('talapatra') || genDesc.toLowerCase().includes('talapatra') || genCat.toLowerCase().includes('talapatra') ||
                         genTitle.toLowerCase().includes('palm leaf') || genDesc.toLowerCase().includes('palm leaf') || genCat.toLowerCase().includes('palm leaf') ||
                         genTitle.toLowerCase().includes('manuscript') || genDesc.toLowerCase().includes('manuscript') || genCat.toLowerCase().includes('manuscript');

      const newBook: Book = {
        id: `ai-gen-${Date.now()}`,
        title: genTitle,
        author: generatedData.author || provisionalBook.author || 'AI Scholar',
        description: genDesc,
        category: genCat || 'AI-Generated Knowledge',
        costToUnlock: generatedData.costToUnlock || provisionalBook.costToUnlock,
        costPerMinute: generatedData.costPerMinute || provisionalBook.costPerMinute,
        chapters: generatedData.chapters || [],
        isUnlocked: true, // Auto unlocked since they paid for fetch!
        folderId: isPalmBook ? 'fol-talapatra' : (activeFolderId || undefined) // Organize directly into active folder or system palm leaf folder!
      };

      onUpdateBooks([newBook, ...books]);

      // Alert & Add Success message to chat
      setMessages(prev => [...prev, {
        id: `acq-${Date.now()}`,
        sender: 'assistant',
        text: `Success! I have fetched and compiled "${newBook.title}" into your structured shelf. The book is fully unlocked and ready to read.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

    } catch (error: any) {
      console.error(error);
      alert(`Error fetching book with AI: ${error.message}`);
    } finally {
      setFetchingBookId(null);
    }
  };

  // Folder management functions
  const handleCreateFolder = (name: string, parentId: string | null) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      parentId
    };
    onUpdateFolders([...folders, newFolder]);
  };

  const handleRenameFolder = (id: string, name: string) => {
    onUpdateFolders(folders.map(f => f.id === id ? { ...f, name } : f));
  };

  const handleDeleteFolder = (id: string) => {
    // Remove folder and reset any assigned books back to null folder
    onUpdateFolders(folders.filter(f => f.id !== id));
    onUpdateBooks(books.map(b => b.folderId === id ? { ...b, folderId: undefined } : b));
    if (activeFolderId === id) {
      setActiveFolderId(null);
    }
  };

  const handleMoveBook = (bookId: string, folderId: string | null) => {
    // Move book
    onUpdateBooks(books.map(b => b.id === bookId ? { ...b, folderId: folderId === 'root' ? undefined : (folderId || undefined) } : b));
  };

  // Book interaction handlers
  const handleUnlockBook = (book: Book) => {
    if (user.credits < book.costToUnlock) {
      alert(t.insufficientCredits);
      return;
    }

    const finalCredits = user.credits - book.costToUnlock;
    onUpdateUserCredits(finalCredits);
    onAddTransaction(-book.costToUnlock, `Unlocked classic book: "${book.title}"`, 'unlock');

    // Update state to make it unlocked
    const updated = books.map(b => b.id === book.id ? { ...b, isUnlocked: true } : b);
    onUpdateBooks(updated);

    // Update details modal if open
    setSelectedBook(prev => prev && prev.id === book.id ? { ...prev, isUnlocked: true } : prev);
  };

  // Top Up Action
  const handleTopUpCredits = (amount: number, packName: string) => {
    const finalCredits = user.credits + amount;
    onUpdateUserCredits(finalCredits);
    onAddTransaction(amount, `Credit top-up: ${packName}`, 'topup');
  };

  // Active books filtered by folder & category selection
  const filteredBooks = books.filter(b => {
    if (activeFolderId !== null && b.folderId !== activeFolderId) {
      return false;
    }
    if (selectedCategory !== null && b.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-screen bg-orange-50 text-slate-900 font-sans overflow-hidden">
      
      {/* Top Application Header */}
      <header className="bg-orange-50 border-b border-orange-300 px-3 sm:px-4 py-2.5 flex items-center justify-between z-30 shadow-lg gap-2">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-orange-200 rounded-lg text-slate-900 hover:text-slate-950 transition-colors"
            id="hamburger-menu-btn"
            title={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-orange-200 border border-orange-400 shrink-0 shadow-md shadow-orange-950/30">
              <img 
                src={appLogoImg} 
                alt="All in One Library Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="hidden md:block">
              <h1 className="text-sm font-serif font-bold text-slate-900 tracking-wide">{t.title}</h1>
              <span className="text-[9px] text-slate-700 font-mono tracking-widest block uppercase font-semibold">ALL IN ONE LIBRARY</span>
            </div>
          </div>
        </div>

        {/* 5 Unified Equal-Sized Navigation & Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap overflow-x-auto no-scrollbar py-0.5">
          {/* Universal Speaker status indicator if reading a book aloud */}
          {currentlySpeakingBookId && (
            <button
              onClick={handleStopAudio}
              className="h-8 sm:h-9 px-2.5 bg-amber-500/20 border border-orange-400 text-slate-900 text-xs font-bold rounded-xl flex items-center gap-1.5 animate-pulse shrink-0"
              title="వినడం ఆపు (Stop Audio)"
            >
              <VolumeX className="w-4 h-4" />
              <span className="hidden md:inline">ఆడియో ఆపు</span>
            </button>
          )}

          {/* 1. Library Button (Reduced 50% width) */}
          <button
            onClick={() => setShowLibraryModal(true)}
            className="h-8 sm:h-9 px-2 sm:px-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all transform active:scale-95 border border-orange-400/40 flex items-center justify-center gap-1 shrink-0"
            id="open-library-modal-btn"
            title="Library"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-800" />
            <span className="whitespace-nowrap font-serif">Library</span>
          </button>

          {/* 2. Chat Button */}
          <button
            onClick={() => setActiveTab('chat')}
            className={`h-8 sm:h-9 px-3 sm:px-3.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 border ${
              activeTab === 'chat'
                ? 'bg-lime-300 text-slate-900 shadow-md border-lime-400'
                : 'bg-lime-200/60 hover:bg-lime-300/80 text-slate-900/90 border-lime-300'
            }`}
            id="tab-toggle-chat"
            title="AI Chat"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-900" />
            <span className="whitespace-nowrap">Chat</span>
          </button>

          {/* 3. Shelf Button */}
          <button
            onClick={() => setActiveTab('shelf')}
            className={`h-8 sm:h-9 px-3 sm:px-3.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 border ${
              activeTab === 'shelf'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-slate-900 shadow-md border-orange-400/40'
                : 'bg-orange-100 hover:bg-orange-200 text-slate-900/90 border-orange-300'
            }`}
            id="tab-toggle-shelf"
            title="Bookshelf"
          >
            <Grid className="w-3.5 h-3.5 text-slate-900" />
            <span className="whitespace-nowrap">Shelf</span>
          </button>

          {/* 4. Writer Button with Speaker */}
          <button 
            onClick={() => setShowWriterModal(true)}
            className="h-8 sm:h-9 px-2 sm:px-2.5 bg-lime-300 hover:bg-lime-400 text-slate-900 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 shadow-md border border-lime-400 shrink-0 transition-all active:scale-95"
            title="రచయితల విభాగం & వాయిస్ కథలు"
            id="open-writer-modal-btn"
          >
            <Sparkles className="w-3 h-3 text-slate-800" />
            <span className="whitespace-nowrap">Writer</span>
            <Volume2 className="w-3 h-3 text-slate-900" />
          </button>

          {/* 4.5 Trees Button */}
          <button 
            onClick={() => setShowTreesModal(true)}
            className="h-8 sm:h-9 px-1.5 sm:px-2 bg-emerald-300 hover:bg-emerald-400 text-slate-900 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 shadow-md border border-emerald-400 shrink-0 transition-all active:scale-95"
            title="వృక్షాల లైబ్రరీ & ఆటోమేటిక్ గుర్తింపు (Green Tree Library & Identification)"
            id="open-trees-modal-btn"
          >
            <Sparkles className="w-3 h-3 text-emerald-800" />
            <span className="whitespace-nowrap text-emerald-950">వృక్షాలు</span>
          </button>

          {/* 5. Logout Button */}
          <button 
            onClick={onLogout}
            className="h-8 sm:h-9 px-2.5 sm:px-3 bg-orange-100 hover:bg-orange-300 text-slate-900 hover:text-rose-300 border border-orange-300 rounded-xl transition-all flex items-center justify-center shrink-0"
            title={t.logout}
            id="logout-btn"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex min-h-0 relative">
        
        {/* Left Hierarchical folders layout - collapsible desktop & mobile */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="hidden lg:block shrink-0 h-full border-r border-slate-800 overflow-hidden"
            >
              <div className="w-72 h-full">
                <FolderPanel
                  folders={folders}
                  books={books}
                  activeFolderId={activeFolderId}
                  onSelectFolder={setActiveFolderId}
                  onCreateFolder={handleCreateFolder}
                  onRenameFolder={handleRenameFolder}
                  onDeleteFolder={handleDeleteFolder}
                  onMoveBook={handleMoveBook}
                  onOpenAdminPanel={() => setShowAdminPanel(true)}
                  currentLanguage={currentLanguage}
                  isAdmin={isAdmin}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic sliding drawer for mobile sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-orange-100 z-40 lg:hidden"
              />
              {/* Drawer Container */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 20 }}
                className="fixed top-0 bottom-0 left-0 w-80 bg-orange-50 border-r border-orange-300 z-50 flex flex-col p-4 lg:hidden"
              >
                <div className="flex justify-between items-center mb-6 pb-2 border-b border-orange-300">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-orange-500 animate-spin" style={{ animationDuration: '20s' }} />
                    <span className="font-serif font-bold text-slate-900 text-sm">Library Menu</span>
                  </div>
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 hover:bg-orange-100 rounded-lg text-slate-600 hover:text-slate-900"
                    id="close-sidebar-drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Language Switcher */}
                <div className="mb-6 bg-orange-100 p-3 rounded-lg border border-orange-300">
                  <label className="block text-[10px] font-semibold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-orange-500" />
                    <span>{t.languageSelect}</span>
                  </label>
                  <select
                    value={currentLanguage}
                    onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                    className="w-full bg-orange-100 border border-orange-300 rounded p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    id="lang-selector-mobile"
                  >
                    {ALL_INDIA_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.native} ({lang.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mobile Folders list */}
                <div className="flex-1 overflow-y-auto">
                  <FolderPanel
                    folders={folders}
                    books={books}
                    activeFolderId={activeFolderId}
                    onSelectFolder={(id) => {
                      setActiveFolderId(id);
                      setSidebarOpen(false); // Auto close
                    }}
                    onCreateFolder={handleCreateFolder}
                    onRenameFolder={handleRenameFolder}
                    onDeleteFolder={handleDeleteFolder}
                    onMoveBook={handleMoveBook}
                    onOpenAdminPanel={() => {
                      setShowAdminPanel(true);
                      setSidebarOpen(false);
                    }}
                    currentLanguage={currentLanguage}
                    isAdmin={isAdmin}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Center Display: Chat Console or Book Shelf */}
        <div className="flex-1 flex flex-col h-full bg-orange-50 relative min-w-0">
          
          {/* TAB 1: AI LIBRARIAN CHAT CONSOLE */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col h-full min-h-0">
              
              {/* Chat sub header */}
              <div className="bg-orange-50 border-b border-orange-300 px-3 py-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-600 to-amber-600 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-slate-800" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-semibold text-slate-900">{t.chatAgentTitle}</h3>
                    <p className="text-[9px] text-slate-800">{t.chatAgentDesc}</p>
                  </div>
                </div>

                {/* New Chat Button, Language Dropdown & Audio Speaker Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setMessages([
                        {
                          id: `welcome-${Date.now()}`,
                          sender: 'assistant',
                          text: currentLanguage === 'te' ? "హాయ్! నేను మీ బ్రహ్మాస్త్ర 3.5 అల్ట్రా. మీకు ఏ విధంగా సహాయం చేయగలను?" : currentLanguage === 'hi' ? "नमस्ते! मैं आपका एआई पुस्तक सहायक हूँ।" : "Hi! I am your Brahmastra 3.5 Ultra. How can I help you today?",
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }
                      ]);
                    }}
                    className="flex items-center gap-1 text-slate-800 hover:text-slate-950 transition py-1 px-1 bg-transparent border-0 cursor-pointer"
                    title={t.newChat}
                  >
                    <Plus className="w-4 h-4 text-slate-900" />
                    <span className="text-[11px] font-bold">{t.newChat}</span>
                  </button>

                  {/* Language Selector Dropdown Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowLangMenu(!showLangMenu)}
                      className="px-2 py-1 rounded-lg bg-orange-600/30 hover:bg-orange-600/50 text-slate-800 border border-orange-400 transition shadow-sm flex items-center gap-1 text-[11px] font-bold"
                      title="భాష మార్చండి (Change Language)"
                      id="header-lang-btn"
                    >
                      <Globe className="w-3.5 h-3.5 text-slate-900" />
                      <span>{ALL_INDIA_LANGUAGES.find(l => l.code === currentLanguage)?.native || 'తెలుగు'}</span>
                    </button>

                    {showLangMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-orange-50 border border-orange-300 rounded-xl shadow-2xl z-50 p-2 space-y-1 max-h-64 overflow-y-auto">
                        <div className="text-[10px] font-bold text-slate-700 px-2 py-1 uppercase border-b border-orange-300 font-mono">
                          భారతీయ భాషలు (Languages)
                        </div>
                        {ALL_INDIA_LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              onLanguageChange(lang.code);
                              setShowLangMenu(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                              currentLanguage === lang.code
                                ? 'bg-orange-600 text-slate-900 font-bold'
                                : 'text-slate-800 hover:bg-orange-200'
                            }`}
                          >
                            <span>{lang.flag} {lang.native} ({lang.name})</span>
                            {currentLanguage === lang.code && <Check className="w-3.5 h-3.5 text-slate-900" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Audio Speaker Button linked to AI recommendation / book reader */}
                  <button
                    onClick={() => {
                      // Find the latest assistant message or recommended book and play audio
                      const lastAssistantMsg = [...messages].reverse().find(m => m.sender === 'assistant');
                      const textToSpeak = lastAssistantMsg ? lastAssistantMsg.text : "హాయ్! నేను మీ బ్రహ్మాస్త్ర 3.5 అల్ట్రా.";
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(textToSpeak);
                        if (currentLanguage === 'te') utterance.lang = 'te-IN';
                        else if (currentLanguage === 'hi') utterance.lang = 'hi-IN';
                        else if (currentLanguage === 'ta') utterance.lang = 'ta-IN';
                        else if (currentLanguage === 'kn') utterance.lang = 'kn-IN';
                        else if (currentLanguage === 'ml') utterance.lang = 'ml-IN';
                        else if (currentLanguage === 'mr') utterance.lang = 'mr-IN';
                        else if (currentLanguage === 'bn') utterance.lang = 'bn-IN';
                        else if (currentLanguage === 'gu') utterance.lang = 'gu-IN';
                        else if (currentLanguage === 'pa') utterance.lang = 'pa-IN';
                        else utterance.lang = 'en-US';
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                    className="p-1.5 rounded-full bg-orange-600/30 hover:bg-orange-600/50 text-slate-800 border border-orange-400 transition shadow-sm flex items-center justify-center"
                    title="వినండి (Listen Audio)"
                  >
                    <Volume2 className="w-4 h-4 text-slate-900" />
                  </button>
                </div>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex flex-col max-w-[90%] ${
                      msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    {/* Message Plain Render without Box Container */}
                    <div className="py-2 px-1 text-xs leading-relaxed space-y-2">
                      {/* Attached Image in Chat */}
                      {msg.imageUrl && (
                        <div className="rounded-xl overflow-hidden max-w-xs border border-white/20">
                          <img src={msg.imageUrl} alt="Chat Attachment" className="w-full max-h-60 object-cover" />
                        </div>
                      )}

                      {/* Attached Video in Chat */}
                      {msg.videoUrl && (
                        <div className="rounded-xl overflow-hidden max-w-xs border border-white/20 bg-orange-100">
                          <video src={msg.videoUrl} controls className="w-full max-h-60 object-contain" />
                        </div>
                      )}

                      {/* Attached Audio in Chat */}
                      {msg.audioUrl && (
                        <div className="p-2 bg-orange-100/30 rounded-xl">
                          <audio src={msg.audioUrl} controls className="w-full h-8" />
                        </div>
                      )}

                      {/* Raw Clean Text without Card Box Board - Compact Clean Typography */}
                      {msg.text && (
                        <p className={`font-sans leading-relaxed tracking-normal ${
                          msg.sender === 'user'
                            ? 'text-xs text-slate-900'
                            : 'text-[11px] sm:text-xs text-slate-900/95 font-medium'
                        }`}>
                          {msg.text}
                        </p>
                      )}

                      {/* Embed Gemini AI-Recommended Book Cards directly in chat logs */}
                      {msg.suggestedBooks && msg.suggestedBooks.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-orange-300 space-y-2.5">
                          <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest block">AI Suggestions:</span>
                          <div className="grid grid-cols-1 gap-2">
                            {msg.suggestedBooks.map((provisionalBook) => {
                              // Cross check if this book already exists in catalog
                              const existingBook = books.find(
                                b => b.title.toLowerCase().trim() === provisionalBook.title.toLowerCase().trim()
                              );

                              const displayBook = existingBook || provisionalBook;

                              return (
                                <div 
                                  key={provisionalBook.id} 
                                  className="bg-orange-50 border border-orange-300 rounded-xl p-2 px-2.5 flex items-start gap-2 shadow-sm hover:border-orange-400 transition-all"
                                >
                                  <div className="p-1 bg-orange-500/10 rounded-lg text-orange-400 border border-orange-500/20 shrink-0">
                                    <BookOpen className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-[11px] font-bold text-slate-900 line-clamp-1">{displayBook.title}</h5>
                                    <p className="text-[9px] text-slate-800 line-clamp-1">by {displayBook.author} • <span className="font-mono text-slate-900 font-bold">{displayBook.costToUnlock} Credits</span></p>
                                    <p className="text-[10px] text-slate-700 line-clamp-1 mt-0.5 leading-normal hidden sm:block">{displayBook.description}</p>
                                    
                                    {/* Action buttons inside book card: 1. Listen (Free ₹0), 2. Read (₹10), 3. Download (₹29) */}
                                    <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                                      {/* 1. Free Audio / Speaker Button */}
                                      <button
                                        type="button"
                                        onClick={(e) => handlePlayBookAudio(displayBook, e)}
                                        className={`text-[9px] px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-sm border ${
                                          currentlySpeakingBookId === displayBook.id
                                            ? 'bg-amber-500 text-slate-950 border-orange-400 animate-pulse'
                                            : 'bg-orange-200 hover:bg-orange-300 text-slate-800 hover:text-slate-950 border-orange-400'
                                        }`}
                                        title={currentlySpeakingBookId === displayBook.id ? 'వినడం ఆపు' : 'వినండి'}
                                      >
                                        {currentlySpeakingBookId === displayBook.id ? (
                                          <>
                                            <VolumeX className="w-3 h-3" />
                                            <span>ఆపు</span>
                                          </>
                                        ) : (
                                          <>
                                            <Volume2 className="w-3 h-3 text-slate-900" />
                                            <span>వినండి</span>
                                          </>
                                        )}
                                      </button>

                                      {/* Sample Book Button (only shown if Sample is enabled in Admin settings and book is locked) */}
                                      {localStorage.getItem('library_is_sample_enabled') !== 'false' && !(existingBook?.isUnlocked || isAdmin) && (
                                        <button
                                          type="button"
                                          onClick={(e) => handleOpenSampleReader(existingBook || displayBook, e)}
                                          className="bg-sky-600 hover:bg-sky-500 text-slate-900 text-[9px] px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-sm border border-sky-500/25"
                                          title="పుస్తకం ఉచిత శాంపిల్ చదవండి"
                                        >
                                          <BookOpen className="w-3 h-3 text-slate-850" />
                                          <span>శాంపిల్ (Sample)</span>
                                        </button>
                                      )}

                                      {/* 2. Read Button (₹10) */}
                                      {(existingBook?.isUnlocked || isAdmin) ? (
                                        <button
                                          onClick={() => onOpenReader(existingBook || displayBook)}
                                          className="bg-emerald-600 hover:bg-emerald-500 text-slate-900 text-[9px] px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-sm"
                                        >
                                          <BookOpenCheck className="w-3 h-3" />
                                          <span>చదవండి</span>
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleOpenPayment(displayBook, 'read')}
                                          className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-900 text-[9px] px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-sm"
                                        >
                                          <QrCode className="w-3 h-3 text-slate-800" />
                                          <span>చదవండి (₹{readPriceINR})</span>
                                        </button>
                                      )}

                                      {/* 3. Download Button (₹29) */}
                                      <button
                                        onClick={() => {
                                          if (isAdmin) {
                                            handleDownloadBook(displayBook);
                                          } else {
                                            handleOpenPayment(displayBook, 'download');
                                          }
                                        }}
                                        className="bg-orange-300 hover:bg-orange-400 border border-orange-300 text-slate-800 text-[9px] px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-sm"
                                      >
                                        <Download className="w-3 h-3 text-slate-900" />
                                        <span>{isAdmin ? 'డౌన్‌లోడ్' : `డౌన్‌లోడ్ (₹${downloadPriceINR})`}</span>
                                      </button>

                                      {/* 4. If new provisional AI book, offer add to shelf button */}
                                      {!existingBook && (
                                        <button
                                          onClick={() => handleFetchBookWithAI(provisionalBook)}
                                          disabled={fetchingBookId !== null}
                                          className="bg-orange-100 hover:bg-orange-200 border border-orange-400 text-slate-900 text-[9px] px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-sm disabled:opacity-50"
                                        >
                                          {fetchingBookId === provisionalBook.id ? (
                                            <>
                                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                              <span>AI...</span>
                                            </>
                                          ) : (
                                            <>
                                              <Sparkles className="w-2.5 h-2.5 text-slate-900" />
                                              <span>జోడించు</span>
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Timestamp */}
                    <span className="text-[9px] text-slate-700/50 mt-1 font-mono tracking-wide">{msg.timestamp}</span>
                  </div>
                ))}

                {/* Typing Loader */}
                {chatLoading && (
                  <div className="flex items-center gap-2 text-slate-700 text-xs font-medium">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                    <span className="font-mono">AI Librarian is scanning bookshelves...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggested Questions Slider */}
              <div className="px-4 py-2 bg-orange-50 border-t border-orange-300 overflow-x-auto whitespace-nowrap flex gap-2 scrollbar-none">
                {suggestedPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(p.value)}
                    className="bg-orange-100 hover:bg-orange-200 border border-orange-300 rounded-lg text-[10px] px-3 py-1.5 text-slate-800 hover:text-slate-950 transition cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Chat Input Console */}
              <div className="p-4 bg-orange-50 border-t border-orange-300 space-y-2">
                {/* Active Attachment Previews */}
                {(chatImageAttachment || chatVideoAttachment || chatAudioAttachment) && (
                  <div className="flex items-center gap-4 pb-2 overflow-x-auto">
                    {chatImageAttachment && (
                      <div className="relative inline-block border border-orange-500 rounded-lg p-1 bg-orange-50 shrink-0">
                        <img src={chatImageAttachment} alt="Preview" className="h-14 w-14 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => setChatImageAttachment(null)}
                          className="absolute -top-1.5 -right-1.5 bg-rose-600 text-slate-900 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleIdentifyWithAttachment(chatImageAttachment)}
                          className="absolute bottom-0 inset-x-0 bg-emerald-600/95 text-slate-900 text-[8px] font-bold py-0.5 rounded-b text-center"
                        >
                          గుర్తించు
                        </button>
                      </div>
                    )}

                    {chatVideoAttachment && (
                      <div className="relative inline-block border border-rose-500 rounded-lg p-1 bg-orange-50 shrink-0">
                        <video src={chatVideoAttachment} className="h-14 w-14 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => setChatVideoAttachment(null)}
                          className="absolute -top-1.5 -right-1.5 bg-rose-600 text-slate-900 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleIdentifyWithAttachment(chatVideoAttachment)}
                          className="absolute bottom-0 inset-x-0 bg-emerald-600/95 text-slate-900 text-[8px] font-bold py-0.5 rounded-b text-center"
                        >
                          గుర్తించు
                        </button>
                      </div>
                    )}

                    {chatAudioAttachment && (
                      <div className="relative inline-block border border-orange-400 rounded-lg p-1.5 bg-orange-50 flex items-center gap-1.5 text-xs text-slate-900">
                        <Mic className="w-4 h-4 text-slate-700" />
                        <span>ఆడియో రికార్డింగ్</span>
                        <button
                          type="button"
                          onClick={() => setChatAudioAttachment(null)}
                          className="bg-rose-600 text-slate-900 rounded-full p-0.5 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Hidden File Inputs */}
                <input 
                  type="file" 
                  ref={imageInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleChatImageSelect} 
                />
                <input 
                  type="file" 
                  ref={videoInputRef} 
                  accept="video/*" 
                  className="hidden" 
                  onChange={handleChatVideoSelect} 
                />
                <input 
                  type="file" 
                  ref={audioInputRef} 
                  accept="audio/*" 
                  className="hidden" 
                  onChange={handleChatAudioSelect} 
                />

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputText);
                  }}
                  className="flex items-center gap-1.5 sm:gap-2"
                >
                  {/* Media Upload Buttons */}
                  <div className="flex items-center gap-1 shrink-0 bg-lime-200/60 border border-lime-300 rounded-xl p-1 shadow-sm">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="p-1.5 hover:bg-lime-300/50 text-slate-800 hover:text-slate-950 rounded-lg transition"
                      title="ఫోటో అప్‌లోడ్ చేయండి (Upload Photo)"
                    >
                      <Image className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="p-1.5 hover:bg-lime-300/50 text-slate-800 hover:text-slate-950 rounded-lg transition"
                      title="వీడియో కథ అప్‌లోడ్ చేయండి (Upload Video Story)"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => audioInputRef.current?.click()}
                      className="p-1.5 hover:bg-lime-300/50 text-slate-800 hover:text-slate-950 rounded-lg transition"
                      title="వాయిస్ రికార్డింగ్ అప్‌లోడ్ చేయండి (Upload Voice Audio)"
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={t.chatPlaceholder}
                    className="flex-1 bg-orange-50 border border-orange-300 rounded-xl py-3 px-4 text-xs text-slate-900 placeholder-amber-400/40 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-sans min-w-0"
                    id="chat-input-field"
                  />
                  <button
                    type="submit"
                    disabled={(!inputText.trim() && !chatImageAttachment && !chatVideoAttachment && !chatAudioAttachment) || chatLoading}
                    className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-40 text-slate-900 p-3 rounded-xl transition duration-250 shrink-0 shadow-md"
                    id="chat-send-btn"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: LIBRARY SHELF */}
          {activeTab === 'shelf' && (
            <div className="flex-1 flex flex-col h-full min-h-0 p-4 sm:p-5">
              
              {/* Shelf head with active folder info & Library Explorer trigger */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-orange-300">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                    <span>
                      {activeFolderId 
                        ? folders.find(f => f.id === activeFolderId)?.name 
                        : t.allBooks
                      }
                    </span>
                    {selectedCategory && (
                      <span className="text-xs bg-orange-500/20 text-orange-300 font-mono px-2 py-0.5 rounded-md border border-orange-500/30 font-sans">
                        {selectedCategory}
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] text-slate-800">
                    {filteredBooks.length} Books matching current folder & category filter
                  </p>
                </div>
                
                {/* Category Explorer Quick Trigger */}
                <button
                  onClick={() => setShowLibraryModal(true)}
                  className="flex items-center gap-1.5 text-xs bg-orange-100 hover:bg-orange-200 border border-orange-300 px-3 py-1.5 rounded-xl text-slate-800 hover:text-slate-950 transition shrink-0"
                >
                  <Filter className="w-3.5 h-3.5 text-orange-400" />
                  <span>{t.categories || 'కేటగిరీలు'}</span>
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-2 scrollbar-none">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === null
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-slate-900 shadow-sm'
                      : 'bg-orange-100 text-slate-800 hover:text-slate-950 border border-orange-300'
                  }`}
                >
                  {t.allCategories}
                </button>
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const localizedTitle = (t as any)[cat.labelKey] || cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-slate-900 shadow-sm'
                          : 'bg-orange-100 text-slate-800 hover:text-slate-950 border border-orange-300'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{localizedTitle}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dual Parallel Books List View */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 overflow-hidden pt-2">
                
                {/* Column 1: General Library Books */}
                <div className="flex flex-col h-full min-h-0 bg-orange-100/20 border border-orange-200 rounded-2xl p-3 sm:p-4 shadow-sm overflow-hidden">
                  <h4 className="text-xs sm:text-sm font-black text-black border-b border-orange-300 pb-2.5 flex items-center gap-2 mb-3">
                    <span className="text-lg">📁</span>
                    <span>సాధారణ గ్రంథాలయం (General Books)</span>
                    <span className="ml-auto bg-orange-200 text-black border border-orange-300 text-[10px] px-2.5 py-0.5 rounded-full font-black">
                      {filteredBooks.filter(b => b.folderId !== 'fol-talapatra').length}
                    </span>
                  </h4>

                  <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                    {filteredBooks.filter(b => b.folderId !== 'fol-talapatra').map((book) => (
                      <div 
                        key={book.id}
                        onClick={() => setSelectedBook(book)}
                        className="bg-white border-2 border-orange-100 hover:border-orange-300 rounded-xl p-2 px-3 flex flex-col sm:flex-row justify-between sm:items-center cursor-pointer transition duration-300 shadow-xs group relative overflow-hidden gap-2"
                      >
                        {/* Soft ambient background per card */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-500/10 to-transparent pointer-events-none rounded-bl-2xl" />
                        
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-1.5">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-[8px] bg-orange-100 text-orange-300 border border-orange-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest font-mono">
                                {book.category}
                              </span>
                              {book.contentType === 'audio' && (
                                <span className="text-[8px] bg-amber-500/20 text-slate-900 border border-orange-400 px-1 py-0.5 rounded font-semibold flex items-center gap-0.5">
                                  <Mic className="w-2 h-2" /> వాయిస్
                                </span>
                              )}
                              {book.contentType === 'video' && (
                                <span className="text-[8px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 py-0.5 rounded font-semibold flex items-center gap-0.5">
                                  <Film className="w-2 h-2" /> వీడియో
                                </span>
                              )}
                            </div>
                            <div className="sm:hidden">
                              {book.isUnlocked ? (
                                <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0 border border-emerald-500/30">
                                  <Check className="w-2 h-2" /> Unlocked
                                </span>
                              ) : (
                                <span className="text-[8px] bg-amber-500/15 text-slate-700 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0 border border-orange-400">
                                  <Lock className="w-2 h-2" /> Locked
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 leading-tight tracking-wide group-hover:text-orange-500 transition-colors line-clamp-1">
                              {book.title}
                            </h4>
                            <div className="hidden sm:block ml-1.5">
                              {book.isUnlocked ? (
                                <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0 border border-emerald-500/30">
                                  <Check className="w-2 h-2" /> Unlocked
                                </span>
                              ) : (
                                <span className="text-[8px] bg-amber-500/15 text-slate-700 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0 border border-orange-400">
                                  <Lock className="w-2 h-2" /> Locked
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-800">by {book.author}</p>
                          <p className="text-[10px] text-slate-700 line-clamp-1 leading-normal mt-0.5 font-sans hidden sm:block">
                            {book.description}
                          </p>
                        </div>

                        {/* Right side specifications & Quick Actions */}
                        <div className="flex flex-row items-center justify-start sm:justify-end gap-1 text-[9px] shrink-0 mt-0.5 sm:mt-0 relative z-10 flex-wrap sm:flex-nowrap">
                          {/* Quick Listen Speaker Button */}
                          <button
                            type="button"
                            onClick={(e) => handlePlayBookAudio(book, e)}
                            className={`px-2 py-1 rounded-lg border transition flex items-center gap-1 shrink-0 cursor-pointer ${
                              currentlySpeakingBookId === book.id
                                ? 'bg-amber-500 text-slate-950 border-orange-400 animate-pulse'
                                : 'bg-orange-200 hover:bg-orange-300 text-slate-800 hover:text-slate-950 border-orange-400'
                            }`}
                            title={currentlySpeakingBookId === book.id ? 'Stop' : 'Listen'}
                          >
                            {currentlySpeakingBookId === book.id ? (
                              <>
                                <VolumeX className="w-3 h-3" />
                                <span>ఆపు</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3 text-slate-900" />
                                <span>వినండి</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-1">
                            {localStorage.getItem('library_is_sample_enabled') !== 'false' && !(book.isUnlocked || isAdmin) && (
                              <button
                                type="button"
                                onClick={(e) => handleOpenSampleReader(book, e)}
                                className="bg-sky-600 hover:bg-sky-500 text-slate-900 px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-sm shrink-0 border border-sky-500/25 cursor-pointer"
                                title="పుస్తకం ఉచిత శాంపిల్ చదవండి"
                              >
                                <BookOpen className="w-3 h-3 text-slate-850" />
                                <span>శాంపిల్</span>
                              </button>
                            )}

                            {(book.isUnlocked || isAdmin) ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenReader(book);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-slate-900 px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
                              >
                                <BookOpenCheck className="w-3 h-3" />
                                <span>చదవండి</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPayment(book, 'read');
                                }}
                                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-900 px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
                              >
                                <QrCode className="w-3 h-3 text-slate-800" />
                                <span>చదవండి (₹{readPriceINR})</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isAdmin) {
                                  handleDownloadBook(book);
                                } else {
                                  handleOpenPayment(book, 'download');
                                }
                              }}
                              className="bg-orange-300 hover:bg-orange-400 border border-orange-300 text-slate-800 px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
                            >
                              <Download className="w-3 h-3 text-slate-900" />
                              <span>{isAdmin ? 'డౌన్‌లోడ్' : `డౌన్‌లోడ్ (₹${downloadPriceINR})`}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredBooks.filter(b => b.folderId !== 'fol-talapatra').length === 0 && (
                      <div className="text-center py-16 text-slate-500 text-xs font-semibold">
                        సాధారణ గ్రంథాలయంలో గ్రంథాలు లేవు.
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Palm Leaf Manuscripts */}
                <div className="flex flex-col h-full min-h-0 bg-amber-50/20 border border-amber-300 rounded-2xl p-3 sm:p-4 shadow-sm overflow-hidden">
                  <h4 className="text-xs sm:text-sm font-black text-black border-b border-amber-300 pb-2.5 flex items-center gap-2 mb-3">
                    <span className="text-lg">📜</span>
                    <span>తాళపత్ర గ్రంథాలు (Palm Leaf Manuscripts)</span>
                    <span className="ml-auto bg-amber-200 text-black border border-amber-300 text-[10px] px-2.5 py-0.5 rounded-full font-black">
                      {filteredBooks.filter(b => b.folderId === 'fol-talapatra').length}
                    </span>
                  </h4>

                  <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                    {filteredBooks.filter(b => b.folderId === 'fol-talapatra').map((book) => (
                      <div 
                        key={book.id}
                        onClick={() => setSelectedBook(book)}
                        className="bg-white border-2 border-amber-100 hover:border-amber-300 rounded-xl p-2 px-3 flex flex-col sm:flex-row justify-between sm:items-center cursor-pointer transition duration-300 shadow-xs group relative overflow-hidden gap-2"
                      >
                        {/* Soft ambient background per card */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none rounded-bl-2xl" />
                        
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-1.5">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-[8px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest font-mono">
                                {book.category}
                              </span>
                              {book.contentType === 'audio' && (
                                <span className="text-[8px] bg-amber-500/20 text-slate-900 border border-orange-400 px-1 py-0.5 rounded font-semibold flex items-center gap-0.5">
                                  <Mic className="w-2 h-2" /> వాయిస్
                                </span>
                              )}
                              {book.contentType === 'video' && (
                                <span className="text-[8px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1 py-0.5 rounded font-semibold flex items-center gap-0.5">
                                  <Film className="w-2 h-2" /> వీడియో
                                </span>
                              )}
                            </div>
                            <div className="sm:hidden">
                              {book.isUnlocked ? (
                                <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0 border border-emerald-500/30">
                                  <Check className="w-2 h-2" /> Unlocked
                                </span>
                              ) : (
                                <span className="text-[8px] bg-amber-500/15 text-slate-700 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0 border border-orange-400">
                                  <Lock className="w-2 h-2" /> Locked
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 leading-tight tracking-wide group-hover:text-amber-600 transition-colors line-clamp-1">
                              {book.title}
                            </h4>
                            <div className="hidden sm:block ml-1.5">
                              {book.isUnlocked ? (
                                <span className="text-[8px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0 border border-emerald-500/30">
                                  <Check className="w-2 h-2" /> Unlocked
                                </span>
                              ) : (
                                <span className="text-[8px] bg-amber-500/15 text-slate-700 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0 border border-orange-400">
                                  <Lock className="w-2 h-2" /> Locked
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-800">by {book.author}</p>
                          <p className="text-[10px] text-slate-700 line-clamp-1 leading-normal mt-0.5 font-sans hidden sm:block">
                            {book.description}
                          </p>
                        </div>

                        {/* Right side specifications & Quick Actions */}
                        <div className="flex flex-row items-center justify-start sm:justify-end gap-1 text-[9px] shrink-0 mt-0.5 sm:mt-0 relative z-10 flex-wrap sm:flex-nowrap">
                          {/* Quick Listen Speaker Button */}
                          <button
                            type="button"
                            onClick={(e) => handlePlayBookAudio(book, e)}
                            className={`px-2 py-1 rounded-lg border transition flex items-center gap-1 shrink-0 cursor-pointer ${
                              currentlySpeakingBookId === book.id
                                ? 'bg-amber-500 text-slate-950 border-orange-400 animate-pulse'
                                : 'bg-orange-200 hover:bg-orange-300 text-slate-800 hover:text-slate-950 border-orange-400'
                            }`}
                            title={currentlySpeakingBookId === book.id ? 'Stop' : 'Listen'}
                          >
                            {currentlySpeakingBookId === book.id ? (
                              <>
                                <VolumeX className="w-3 h-3" />
                                <span>ఆపు</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3 text-slate-900" />
                                <span>వినండి</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-1">
                            {localStorage.getItem('library_is_sample_enabled') !== 'false' && !(book.isUnlocked || isAdmin) && (
                              <button
                                type="button"
                                onClick={(e) => handleOpenSampleReader(book, e)}
                                className="bg-sky-600 hover:bg-sky-500 text-slate-900 px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-sm shrink-0 border border-sky-500/25 cursor-pointer"
                                title="పుస్తకం ఉచిత శాంపిల్ చదవండి"
                              >
                                <BookOpen className="w-3 h-3 text-slate-850" />
                                <span>శాంపిల్</span>
                              </button>
                            )}

                            {(book.isUnlocked || isAdmin) ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenReader(book);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-slate-900 px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
                              >
                                <BookOpenCheck className="w-3 h-3" />
                                <span>చదవండి</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenPayment(book, 'read');
                                }}
                                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-900 px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
                              >
                                <QrCode className="w-3 h-3 text-slate-800" />
                                <span>చదవండి (₹{readPriceINR})</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isAdmin) {
                                  handleDownloadBook(book);
                                } else {
                                  handleOpenPayment(book, 'download');
                                }
                              }}
                              className="bg-orange-300 hover:bg-orange-400 border border-orange-300 text-slate-800 px-2 py-1 rounded-lg font-bold transition flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
                            >
                              <Download className="w-3 h-3 text-slate-900" />
                              <span>{isAdmin ? 'డౌన్‌లోడ్' : `డౌన్‌లోడ్ (₹${downloadPriceINR})`}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredBooks.filter(b => b.folderId === 'fol-talapatra').length === 0 && (
                      <div className="text-center py-16 text-slate-500 text-xs font-semibold">
                        తాళపత్ర గ్రంథాలయంలో గ్రంథాలు లేవు.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Right Credits & Transaction Sidebar - Desktop only */}
        <div className="hidden xl:block w-80 shrink-0 h-full">
          <PricingPanel
            credits={user.credits}
            transactions={transactions}
            onTopUp={handleTopUpCredits}
            currentLanguage={currentLanguage}
          />
        </div>
      </div>

      {/* Book Detail Overlay Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-orange-900/20 flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="bg-orange-100 border border-orange-300 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button 
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-orange-300 rounded-lg text-slate-700 hover:text-slate-950"
              id="close-book-detail-modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Category / Cover */}
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400 font-mono block mb-2">
              {selectedBook.category}
            </span>

            {/* Title / Author */}
            <h3 className="text-lg font-serif font-bold text-slate-900 tracking-wide mb-1 leading-snug">
              {selectedBook.title}
            </h3>
            <p className="text-xs text-slate-800 mb-4">by {selectedBook.author}</p>

            <div className="h-px bg-orange-200 mb-4" />

            {/* Metadata & Cost info */}
            <div className="grid grid-cols-2 gap-3 mb-5 text-xs font-mono">
              <div className="bg-orange-100 p-2.5 rounded-lg border border-orange-300">
                <span className="text-[9px] text-slate-700/60 block uppercase font-sans">Acquisition Cost</span>
                <span className="text-slate-900 font-bold text-sm">{selectedBook.costToUnlock} Credits</span>
              </div>
              <div className="bg-orange-100 p-2.5 rounded-lg border border-orange-300">
                <span className="text-[9px] text-slate-700/60 block uppercase font-sans">Reading Rate</span>
                <span className="text-slate-800 font-bold text-sm">{selectedBook.costPerMinute} cr/min</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <span className="text-[10px] uppercase font-semibold text-slate-700/60 block mb-1.5">Description</span>
              <p className="text-slate-900/90 text-xs leading-relaxed max-h-36 overflow-y-auto font-sans">
                {selectedBook.description}
              </p>
            </div>

            {/* Action panel */}
            <div className="space-y-3">
              {/* Speaker Play / Listen directly in modal */}
              <button
                type="button"
                onClick={(e) => handlePlayBookAudio(selectedBook, e)}
                className={`w-full py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition text-xs shadow-md ${
                  currentlySpeakingBookId === selectedBook.id
                    ? 'bg-amber-500 text-slate-950 border-orange-400 animate-pulse'
                    : 'bg-orange-200 hover:bg-orange-300 text-slate-800 hover:text-slate-950 border-orange-400'
                }`}
              >
                {currentlySpeakingBookId === selectedBook.id ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>స్పీకర్‌లో వినడం ఆపు (Stop Audio)</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-slate-900" />
                    <span>స్పీకర్‌లో వినండి (Listen Audio / Speaker)</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(selectedBook.isUnlocked || isAdmin) ? (
                  <button
                    onClick={() => {
                      onOpenReader(selectedBook);
                      setSelectedBook(null);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-xs"
                    id="modal-start-reading-btn"
                  >
                    <BookOpenCheck className="w-4 h-4 fill-current" />
                    <span>చదవండి (Read)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleOpenPayment(selectedBook, 'read');
                      setSelectedBook(null);
                    }}
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-900 font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-xs"
                    id="modal-read-pay-btn"
                  >
                    <QrCode className="w-4 h-4 text-slate-800" />
                    <span>చదవండి (₹{readPriceINR})</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (isAdmin) {
                      handleDownloadBook(selectedBook);
                    } else {
                      handleOpenPayment(selectedBook, 'download');
                    }
                    setSelectedBook(null);
                  }}
                  className="w-full bg-orange-300 hover:bg-orange-400 border border-orange-300 text-slate-800 font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-xs"
                  id="modal-download-pay-btn"
                >
                  <Download className="w-4 h-4 text-slate-900" />
                  <span>{isAdmin ? 'డౌన్‌లోడ్ (Download)' : `డౌన్‌లోడ్ (₹${downloadPriceINR})`}</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-900/60">
                <QrCode className="w-3.5 h-3.5 text-orange-400" />
                <span>UPI QR కోడ్ ద్వారా నేరుగా చెల్లించి అన్‌లాక్ చేసుకోండి</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPI QR Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        book={paymentModalBook}
        mode={paymentModalMode}
        onSuccess={handlePaymentSuccess}
        currentLanguage={currentLanguage}
        readPrice={readPriceINR}
        downloadPrice={downloadPriceINR}
        upiId={adminUpiId}
      />

      {/* Admin Panel Modal Overlay */}
      {showAdminPanel && (
        <AdminPanel
          user={user}
          books={books}
          folders={folders}
          writerApplications={writerApplications}
          onClose={() => setShowAdminPanel(false)}
          onAddBook={onAddBook}
          onDeleteBook={onDeleteBook}
          onUpdateBooks={onUpdateBooks}
          onApproveApplication={(app) => {
            const isPalm = app.bookTitle.toLowerCase().includes('తాళపత్ర') || (app.bio && app.bio.toLowerCase().includes('తాళపత్ర')) || (app.category && app.category.toLowerCase().includes('తాళపత్ర')) ||
                           app.bookTitle.toLowerCase().includes('talapatra') || (app.bio && app.bio.toLowerCase().includes('talapatra')) || (app.category && app.category.toLowerCase().includes('talapatra')) ||
                           app.bookTitle.toLowerCase().includes('palm leaf') || (app.bio && app.bio.toLowerCase().includes('palm leaf')) || (app.category && app.category.toLowerCase().includes('palm leaf')) ||
                           app.bookTitle.toLowerCase().includes('manuscript') || (app.bio && app.bio.toLowerCase().includes('manuscript')) || (app.category && app.category.toLowerCase().includes('manuscript'));
            const approvedBook: Book = {
              id: `writer-book-${Date.now()}`,
              title: app.bookTitle,
              author: app.name,
              category: app.category || 'General',
              contentType: app.contentType,
              audioUrl: app.audioUrl,
              videoUrl: app.videoUrl,
              description: app.bio || 'రచయిత సమర్పించిన రచన.',
              coverImage: app.contentType === 'audio'
                ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80'
                : app.contentType === 'video'
                ? 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80'
                : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
              costToUnlock: 0,
              costPerMinute: 1,
              isUnlocked: true,
              folderId: isPalm ? 'fol-talapatra' : undefined,
              chapters: [
                {
                  id: `ch-1`,
                  title: `${app.bookTitle} - ప్రధాన భాగం`,
                  content: app.storyText || app.bio || 'కథ ప్రారంభం...',
                  audioUrl: app.audioUrl,
                  videoUrl: app.videoUrl
                }
              ],
              language: app.language
            };
            onAddBook(approvedBook);
            if (onApproveWriterApplication) {
              onApproveWriterApplication(app);
            } else {
              app.status = 'approved';
            }
          }}
          currentLanguage={currentLanguage}
          registeredTrees={registeredTrees}
          onApproveTree={onApproveTree}
          onRejectTree={onRejectTree}
          onDeleteTree={onDeleteTree}
        />
      )}

      {/* Writer Registration Modal */}
      {showWriterModal && (
        <WriterRegistrationModal
          onClose={() => setShowWriterModal(false)}
          currentLanguage={currentLanguage}
          onRegister={(app) => {
            onRegisterWriter(app);
            alert("Registration submitted to Admin!");
          }}
        />
      )}

      {/* Trees / Green Library Modal */}
      {showTreesModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in text-slate-900 select-none">
          <div className="bg-orange-50 border border-orange-200 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-4 text-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-200 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">వృక్షాల శోధన & గుర్తింపు విజ్ఞాన సర్వస్వం (Tree Encyclopedia)</h3>
                  <p className="text-[10px] text-emerald-100">AI ఆధారిత వృక్ష గుర్తింపు మరియు నమ్మకమైన హరిత లైబ్రరీ</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowTreesModal(false)}
                className="p-1 bg-emerald-800/40 hover:bg-emerald-800/60 rounded-full transition text-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 bg-orange-50/50">
              
              {/* Left Side: Identify / Register Tree */}
              <div className="w-full md:w-1/2 p-5 border-r border-orange-200 overflow-y-auto space-y-4 flex flex-col">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">మొక్కను గుర్తించండి (Identify & Register)</h4>
                  <p className="text-[11px] text-slate-700 leading-normal">
                    మీరు పెంచుతున్న లేదా చూసిన ఒక మొక్క/చెట్టు ఫోటోను అప్‌లోడ్ చేయండి. Gemini AI దానికి సంబంధించిన 20+ సాంస్కృతిక, శాస్త్రీయ మరియు ప్రాంతీయ పేర్లను లెక్కిస్తుంది!
                  </p>
                </div>

                {/* Image Controls */}
                {treeFormImage && (
                  <div className="flex justify-end mb-2">
                    <div className="inline-flex border border-emerald-200 rounded-lg overflow-hidden shadow-sm">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          treeImageInputRef.current?.click();
                        }}
                        className="flex items-center justify-center p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors w-10"
                        title="మార్చు (Change)"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <div className="w-px bg-emerald-200"></div>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTreeFormImage(null);
                          setIdentifiedTreeDetails(null);
                          setTreeFormName('');
                          if (treeImageInputRef.current) {
                            treeImageInputRef.current.value = '';
                          }
                        }}
                        className="flex items-center justify-center p-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors w-10"
                        title="తొలగించు (Delete)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Zone */}
                <div 
                  onClick={() => !treeFormImage && treeImageInputRef.current?.click()}
                  className={`relative border-2 border-dashed border-emerald-400 bg-emerald-500/5 rounded-xl p-5 text-center transition space-y-2 ${!treeFormImage ? 'hover:border-emerald-600 hover:bg-emerald-500/10 cursor-pointer' : ''}`}
                >
                  <input 
                    type="file"
                    ref={treeImageInputRef}
                    onChange={handleIdentifyTree}
                    accept="image/*"
                    className="hidden"
                  />
                  {treeFormImage ? (
                    <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden border border-orange-200 shadow-sm">
                      <img src={treeFormImage} alt="Selected plant" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="py-4">
                      <Image className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-800">ఫోటో అప్‌లోడ్ చేయండి (Upload Photo)</p>
                      <p className="text-[10px] text-slate-600">Drag & Drop or Click to choose image</p>
                    </div>
                  )}
                </div>

                {/* Identifying Screen */}
                {isIdentifyingTree && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-3 py-8 animate-pulse">
                    <Loader2 className="w-8 h-8 text-emerald-700 animate-spin mx-auto" />
                    <div>
                      <h5 className="text-xs font-bold text-emerald-950">Gemini AI విశ్లేషిస్తోంది...</h5>
                      <p className="text-[10px] text-slate-700 mt-1">ఆ మొక్క ఆకులు, పువ్వులు మరియు కాండం ఆధారంగా 20 కంటే ఎక్కువ రకాల పేర్లతో కూడిన నివేదికను తయారుచేస్తోంది.</p>
                    </div>
                  </div>
                )}

                {/* Identified Details Form */}
                {identifiedTreeDetails && !isIdentifyingTree && (
                  <div className="space-y-3 bg-orange-100/50 border border-orange-200 rounded-xl p-4 animate-fade-in text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold border-b border-orange-200 pb-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>గుర్తించబడిన వృక్ష వివరాలు (AI Identification Complete)</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-700 font-semibold block">మొక్క సాధారణ పేరు:</span>
                      <input 
                        type="text" 
                        value={treeFormName}
                        onChange={(e) => setTreeFormName(e.target.value)}
                        className="w-full bg-orange-50 border border-orange-300 rounded-lg px-3 py-1.5 font-bold text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-800 font-sans">
                      <div><strong>శాస్త్రీయ నామం:</strong> <span className="italic">{identifiedTreeDetails.botanicalName}</span></div>
                      <div><strong>సంస్కృతం:</strong> {identifiedTreeDetails.sanskritNames?.join(', ')}</div>
                      <div className="col-span-2"><strong>తెలుగు:</strong> {identifiedTreeDetails.teluguNames?.join(', ')}</div>
                      <div className="col-span-2"><strong>హిందీ:</strong> {identifiedTreeDetails.hindiNames?.join(', ')}</div>
                    </div>

                    <div className="space-y-2 border-t border-orange-200 pt-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-800 mb-1">నాటిన వారి పేరు (Planter Name) *</label>
                        <input 
                          type="text" 
                          value={treeFormPlanter}
                          onChange={(e) => setTreeFormPlanter(e.target.value)}
                          placeholder="ఉదా: వెంకట్ రావు గారు"
                          className="w-full bg-orange-50 border border-orange-300 rounded-lg px-3 py-1.5"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-800 mb-1">ప్రదేశం (Location / Garden Area)</label>
                        <input 
                          type="text" 
                          value={treeFormLocation}
                          onChange={(e) => setTreeFormLocation(e.target.value)}
                          placeholder="ఉదా: ఇంటి తోట, కరీంనగర్"
                          className="w-full bg-orange-50 border border-orange-300 rounded-lg px-3 py-1.5"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRegisterTreeSubmit}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-900 font-bold rounded-xl transition shadow-md shadow-emerald-600/20"
                    >
                      నమోదు దరఖాస్తు సమర్పించు (Register Tree)
                    </button>
                  </div>
                )}
              </div>

              {/* Right Side: Approved Trees Gallery */}
              <div className="w-full md:w-1/2 p-5 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">హరిత వృక్ష గ్యాలరీ (Green Library Gallery)</h4>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-0.5 rounded-full">
                    ఆమోదించబడినవి: {registeredTrees.filter(t => t.status === 'approved').length}
                  </span>
                </div>

                {registeredTrees.filter(t => t.status === 'approved').length === 0 ? (
                  <div className="bg-orange-50/40 border border-orange-200 rounded-xl p-8 text-center space-y-2">
                    <Sparkles className="w-8 h-8 text-emerald-600/60 mx-auto" />
                    <h5 className="text-xs font-bold text-slate-800">గ్యాలరీలో ఇంకా ఎటువంటి వృక్షాలు ఆమోదించబడలేదు</h5>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      మొక్కను ఎడమవైపున గుర్తించి నమోదు చేయండి. అడ్మిన్ ప్యానెల్‌లో ఆమోదం పొందిన తర్వాత అది ఇక్కడ ప్రత్యక్షంగా అందరికీ కనిపిస్తుంది.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {registeredTrees.filter(t => t.status === 'approved').map((tree) => (
                      <div 
                        key={tree.id} 
                        onClick={() => setSelectedTreeDetail(tree)}
                        className="bg-orange-50 border border-orange-200 hover:border-emerald-500/40 hover:shadow-md rounded-xl p-3 flex gap-3 transition cursor-pointer relative group"
                      >
                        {onDeleteTree && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('ఈ మొక్క వివరాలను తొలగించాలనుకుంటున్నారా?')) {
                                onDeleteTree(tree.id);
                                if (selectedTreeDetail?.id === tree.id) {
                                  setSelectedTreeDetail(null);
                                }
                              }
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full transition-colors opacity-0 group-hover:opacity-100 shadow-sm z-10"
                            title="Delete Tree"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                        {tree.photoUrl && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-orange-200">
                            <img src={tree.photoUrl} alt={tree.treeName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1 space-y-0.5 text-xs">
                          <h5 className="font-bold text-slate-900 truncate">{tree.treeName}</h5>
                          <p className="text-[10px] text-slate-600 italic truncate">{tree.botanicalName}</p>
                          <p className="text-[10px] text-slate-850 truncate font-sans">Planter: <strong>{tree.planterName}</strong></p>
                          <span className="text-[9px] text-emerald-700 bg-emerald-500/10 px-1.5 py-0.5 rounded inline-block font-sans">
                            {tree.location || 'India'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Modal: Tree Details Deep View */}
          {selectedTreeDetail && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-55 animate-fade-in">
              <div className="bg-orange-50 border border-orange-300 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[80vh] text-slate-900">
                <div className="bg-emerald-800 p-4 text-slate-100 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">{selectedTreeDetail.treeName}</h4>
                      <p className="text-[9px] text-emerald-100 italic">{selectedTreeDetail.botanicalName}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedTreeDetail(null)} className="p-1 bg-emerald-900/40 hover:bg-emerald-900/60 rounded-full text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 overflow-y-auto space-y-4 text-xs leading-normal">
                  {selectedTreeDetail.photoUrl && (
                    <div className="w-full h-48 rounded-xl overflow-hidden border border-orange-200">
                      <img src={selectedTreeDetail.photoUrl} alt={selectedTreeDetail.treeName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20 space-y-2">
                      <h5 className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider">వృక్ష నామ వైవిధ్యం (20+ Exhaustive AI Names)</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px]">
                        <div><strong>శాస్త్రీయ నామం:</strong> <span className="italic text-slate-800">{selectedTreeDetail.botanicalName}</span></div>
                        <div><strong>సంస్కృత నామాలు:</strong> {selectedTreeDetail.sanskritNames?.join(', ') || 'N/A'}</div>
                        <div><strong>తెలుగు నామాలు:</strong> {selectedTreeDetail.teluguNames?.join(', ') || 'N/A'}</div>
                        <div><strong>హిందీ నామాలు:</strong> {selectedTreeDetail.hindiNames?.join(', ') || 'N/A'}</div>
                        <div><strong>తమిళ నామాలు:</strong> {selectedTreeDetail.tamilNames?.join(', ') || 'N/A'}</div>
                        <div><strong>కన్నడ నామాలు:</strong> {selectedTreeDetail.kannadaNames?.join(', ') || 'N/A'}</div>
                        <div><strong>ఇంగ్లీష్ నామాలు:</strong> {selectedTreeDetail.englishNames?.join(', ') || 'N/A'}</div>
                        <div className="col-span-2"><strong>ఇతర పేర్లు (AI Recognized):</strong> {selectedTreeDetail.otherNames?.join(', ') || 'N/A'}</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">వివరణ (Description)</h5>
                      <p className="text-slate-800 bg-orange-100/30 p-2.5 rounded-lg border border-orange-200 leading-relaxed">{selectedTreeDetail.description}</p>
                    </div>

                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">వైద్య లేదా సాంస్కృతిక ఉపయోగాలు (Medicinal & Cultural Uses)</h5>
                      <p className="text-slate-800 bg-orange-100/30 p-2.5 rounded-lg border border-orange-200 leading-relaxed">{selectedTreeDetail.medicinalUses}</p>
                    </div>

                    <div className="pt-3 border-t border-orange-200 flex justify-between items-end text-[10px] text-slate-600">
                      <div>
                        <div>Planter: <strong>{selectedTreeDetail.planterName}</strong></div>
                        <div>Location: <strong>{selectedTreeDetail.location} ({selectedTreeDetail.datePlanted})</strong></div>
                      </div>
                      {onDeleteTree && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('ఈ మొక్క వివరాలను తొలగించాలనుకుంటున్నారా?')) {
                              onDeleteTree(selectedTreeDetail.id);
                              setSelectedTreeDetail(null);
                            }
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 rounded-lg transition-colors font-bold"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="hidden sm:inline">తొలగించు</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Library Hub Modal */}
      <LibraryModal
        isOpen={showLibraryModal}
        onClose={() => setShowLibraryModal(false)}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenAdminPanel={() => setShowAdminPanel(true)}
        user={user}
        folders={folders}
        activeFolderId={activeFolderId}
        onSelectFolder={setActiveFolderId}
      />
    </div>
  );
}
