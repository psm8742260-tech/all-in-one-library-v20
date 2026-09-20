import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Type as FontIcon, 
  Search, Info, Clock, Coins, Lock, Sparkles, CheckCircle2, Play, Square, ZoomIn, ZoomOut,
  Mic, Film, Music, Volume2, Video, Star, MoreVertical, FileText, Download
} from 'lucide-react';
import { Book, LanguageCode, TRANSLATIONS } from '../types';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker path utilizing local worker for standard offline execution
if (typeof (Promise as any).try !== 'function') {
  (Promise as any).try = function(fn: any, ...args: any[]) {
    return new Promise(resolve => resolve(fn(...args)));
  };
}
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface ReaderProps {
  book: Book;
  credits: number;
  onClose: () => void;
  onDeductCredits: (amount: number, description: string) => void;
  currentLanguage: LanguageCode;
}

export default function Reader({ book, credits, onClose, onDeductCredits, currentLanguage }: ReaderProps) {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [fontSize, setFontSize] = useState<number>(18); // default size px
  const [theme, setTheme] = useState<'light' | 'sepia' | 'dark'>('sepia');
  const [searchQuery, setSearchQuery] = useState('');
  const [isReadingSessionActive, setIsReadingSessionActive] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [accumulatedDeductions, setAccumulatedDeductions] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Robustly extract the active chapter or mock a chapter if raw text is provided instead of a structured array
  const currentChapter: any = book.chapters && book.chapters.length > 0 
    ? (book.chapters[activeChapterIndex] || book.chapters[0]) 
    : (book.content || book.text || book.body || book.pages ? { title: book.title, content: Array.isArray(book.pages) ? book.pages.join('\n\n') : (book.content || book.text || book.body || '') } : null);

  // Detect PDF URL inside book content, text, body, chapter, description
  const getPdfUrl = () => {
    if (book.contentType === 'audio' || book.contentType === 'video') return null;
    
    // Explicit PDF URL fields
    if (book.pdfUrl && typeof book.pdfUrl === 'string' && book.pdfUrl.trim()) {
      return book.pdfUrl.trim();
    }
    if (book.fileUrl && typeof book.fileUrl === 'string' && (book.fileUrl.toLowerCase().includes('.pdf') || book.fileUrl.includes('/uploads/'))) {
      return book.fileUrl.trim();
    }
    if (book.url && typeof book.url === 'string' && book.url.toLowerCase().includes('.pdf')) {
      return book.url.trim();
    }

    const pdfPattern = /(https?:\/\/[^\s"']+\.pdf[^\s"']*|\/uploads\/[^\s"']+\.pdf[^\s"']*|data:application\/pdf;base64,[^\s"']+)/i;
    
    // Check chapter content and titles
    if (Array.isArray(book.chapters)) {
      for (const ch of book.chapters) {
        if (typeof ch?.content === 'string') {
          const match = ch.content.match(pdfPattern);
          if (match) return match[0];
        }
        if (typeof ch?.title === 'string') {
          const match = ch.title.match(pdfPattern);
          if (match) return match[0];
        }
      }
    }
    
    // Check book metadata fields
    const fields = [book.description, book.content, book.text, book.body];
    for (const field of fields) {
      if (typeof field === 'string') {
        const match = field.match(pdfPattern);
        if (match) return match[0];
      }
    }
    
    return null;
  };

  const pdfUrl = getPdfUrl();

  // PDF.js rendering engine states
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfScale, setPdfScale] = useState<number>(1.25);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reset page index when chapter changes
  useEffect(() => {
    setActivePageIndex(0);
  }, [activeChapterIndex]);

  // Load PDF Document when pdfUrl changes.
  useEffect(() => {
    if (!pdfUrl) {
      setPdfDoc(null);
      setPdfLoading(false);
      return;
    }

    setPdfLoading(true);
    setPdfError(null);

    let isMounted = true;
    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      cMapUrl: 'https://unpkg.com/pdfjs-dist@' + pdfjsLib.version + '/cmaps/',
      cMapPacked: true,
    });

    loadingTask.promise.then((doc) => {
      if (isMounted) {
        setPdfDoc(doc);
        setPdfLoading(false);
      }
    }).catch((err) => {
      console.warn("PDF.js loading warning, falling back to native iframe:", err);
      if (isMounted) {
        setPdfLoading(false);
        setPdfError(err?.message || "Failed to parse PDF");
      }
    });

    return () => {
      isMounted = false;
      try {
        loadingTask.destroy();
      } catch (e) {}
    };
  }, [pdfUrl]);

  // Programmatically render the active PDF page on canvas
  useEffect(() => {
    if (!pdfDoc) return;

    const pageNum = activePageIndex + 1;
    if (pageNum < 1 || pageNum > pdfDoc.numPages) return;

    let renderTask: any = null;

    pdfDoc.getPage(pageNum).then((page: any) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      const viewport = page.getViewport({ scale: pdfScale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      renderTask = page.render(renderContext);
      renderTask.promise.catch((err: any) => {
        if (err.name !== 'RenderingCancelledException') {
          console.error("Page render error:", err);
        }
      });
    });

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, activePageIndex, pdfScale]);

  const getTotalCharacters = () => {
    if (book.chapters && book.chapters.length > 0) {
       return book.chapters.reduce((sum, chap) => sum + (chap.content ? String(chap.content).length : 0), 0);
    }
    if (Array.isArray(book.pages)) return book.pages.join('').length;
    return String(book.content || book.text || book.body || '').length;
  };

  const getTotalWords = () => {
    if (book.chapters && book.chapters.length > 0) {
       return book.chapters.reduce((sum, chap) => sum + (chap.content ? String(chap.content).split(/\s+/).filter(Boolean).length : 0), 0);
    }
    if (Array.isArray(book.pages)) return book.pages.join(' ').split(/\s+/).filter(Boolean).length;
    return String(book.content || book.text || book.body || '').split(/\s+/).filter(Boolean).length;
  };

  const t = TRANSLATIONS[currentLanguage];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Text to speech narration toggle
  const toggleSpeechNarration = () => {
    if (!currentChapter) return;
    if (!('speechSynthesis' in window)) {
      alert('ఆడియో స్పీచ్ సదుపాయం అందుబాటులో లేదు.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = `${currentChapter.title || ''}. ${currentChapter.content || ''}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;

    if (currentLanguage === 'te') utterance.lang = 'te-IN';
    else if (currentLanguage === 'hi') utterance.lang = 'hi-IN';
    else if (currentLanguage === 'ta') utterance.lang = 'ta-IN';
    else utterance.lang = 'en-US';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-deduct credits every 10 seconds for simulation purposes (so it's highly interactive!)
  // In real terms, it deducts 1 credit per minute, but to make it feel responsive in the preview we deduct 1 credit every 10 seconds of active session.
  useEffect(() => {
    if (isReadingSessionActive) {
      timerRef.current = setInterval(() => {
        setSessionSeconds(prev => {
          const nextSec = prev + 1;
          // Every 10 seconds, deduct credits
          if (nextSec % 10 === 0) {
            const cost = book.costPerMinute;
            if (credits >= cost) {
              onDeductCredits(cost, `Active reading session of "${book.title}"`);
              setAccumulatedDeductions(acc => acc + cost);
            } else {
              // Out of credits
              setIsReadingSessionActive(false);
              alert(t.insufficientCredits);
            }
          }
          return nextSec;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isReadingSessionActive, credits, book.costPerMinute, onDeductCredits]);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- Robust Pagination Engine (Array & String) ---
  const isDirectPagesArray = Array.isArray(book.pages) && book.pages.length > 0;

  let totalPages = 1;
  let activeParagraphs: string[] = [];
  let allParagraphsCount = 0;

  if (pdfUrl) {
    totalPages = pdfDoc ? pdfDoc.numPages : (book.pageCount || 1);
    activeParagraphs = [];
    allParagraphsCount = 0;
  } else if (isDirectPagesArray) {
    totalPages = book.pages!.length;
    const pageContent = book.pages![activePageIndex] || "ఈ పేజీలో కంటెంట్ ఖాళీగా ఉంది.";
    activeParagraphs = typeof pageContent === 'string' ? pageContent.split(/\n+/).filter(p => p.trim()) : [String(pageContent)];
    allParagraphsCount = totalPages;
  } else {
    let rawContentString = '';
    const chapterText = typeof currentChapter?.content === 'string' ? currentChapter.content : '';
    
    if (chapterText.trim() && !chapterText.includes('ఉదాహరణ కోసం ఉంచబడిన పాఠ్యం') && !chapterText.includes('ఈ అధ్యాయంలో సమాచారం ఇంకా పూర్తికాలేదు')) {
      rawContentString = chapterText;
    } else if (typeof book.content === 'string' && book.content.trim() && !book.content.includes('ఈ అధ్యాయంలో సమాచారం ఇంకా పూర్తికాలేదు')) {
      rawContentString = book.content;
    } else if (typeof book.text === 'string' && book.text.trim()) {
      rawContentString = book.text;
    } else if (typeof book.body === 'string' && book.body.trim()) {
      rawContentString = book.body;
    }
    
    let allParagraphs = rawContentString.split(/\n+/).filter((p: string) => p.trim().length > 0);
    
    // If it's a huge single block of text without paragraphs, chunk it manually
    if (allParagraphs.length === 1 && allParagraphs[0].length > 1000) {
      allParagraphs = allParagraphs[0].match(/.{1,800}(\s|$)/g) || [allParagraphs[0]];
    }
    
    allParagraphsCount = allParagraphs.length;
    const PARAGRAPHS_PER_PAGE = Math.max(1, allParagraphsCount);
    totalPages = Math.max(1, Math.ceil(allParagraphs.length / PARAGRAPHS_PER_PAGE));
    activeParagraphs = allParagraphs.slice(activePageIndex * PARAGRAPHS_PER_PAGE, (activePageIndex + 1) * PARAGRAPHS_PER_PAGE);
  }

  // Highlight search words
  const renderParagraph = (text: string, index: number) => {
    if (!searchQuery) {
      return <p key={index} style={{ fontSize: `${fontSize}px` }} className={`leading-relaxed font-serif mb-5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-800'}`}>{text}</p>;
    }

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);

    return (
      <p key={index} style={{ fontSize: `${fontSize}px` }} className={`leading-relaxed font-serif mb-5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-800'}`}>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <mark key={i} className="bg-amber-300 text-slate-950 px-1 rounded font-serif">{part}</mark>
          ) : (
            part
          )
        )}
      </p>
    );
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark': return 'bg-slate-900 text-slate-200';
      case 'light': return 'bg-white text-slate-900';
      case 'sepia': default: return 'bg-amber-50/70 text-slate-900';
    }
  };

  return (
    <div className={`flex flex-col h-full relative ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Reader header - Re-designed to match PDF Style */}
      <header className={`flex justify-between items-center px-4 py-3 border-b shadow-xs z-30 sticky top-0 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className={`p-1 rounded-full transition-all active:scale-90 ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'}`}
            id="reader-back-btn"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex flex-col">
            <h3 className={`font-sans font-semibold text-base line-clamp-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>
              {book.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <Sparkles className="w-5 h-5" />
          </button>
          <button className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <Search className="w-5 h-5" />
          </button>
          <button className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Floating Page Counter - Matches Screenshot */}
      {!pdfUrl && (
        <div className="absolute top-20 right-6 z-40 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg pointer-events-none">
          {activePageIndex + 1} / {totalPages}
        </div>
      )}

      {/* Sample Mode Golden Banner */}
      {book.isSampleMode && !pdfUrl && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-4 py-2.5 flex flex-col sm:flex-row justify-between items-center text-xs font-bold shadow-md border-b border-orange-600 gap-2 z-10">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span>
              మీరు శాంపిల్ రీడింగ్ మోడ్‌లో ఉన్నారు (కేవలం పరిమిత పేజీలు మాత్రమే). పూర్తి పుస్తకాన్ని చదవడానికి అన్‌లాక్ చేయండి!
            </span>
          </div>
          <div className="text-[10px] bg-slate-950 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded-full font-mono uppercase shrink-0">
            Sample Book Mode
          </div>
        </div>
      )}

      {/* Credit / Billing Active Bar */}
      <AnimatePresence>
        {isReadingSessionActive && !pdfUrl && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-indigo-900 text-indigo-100 px-4 py-2 flex justify-between items-center text-xs font-medium"
          >
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-700 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="font-mono">{formatTime(sessionSeconds)}</span>
              <span className="text-[10px] text-indigo-300">({t.readingSessionActive})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-indigo-300">Rate: {book.costPerMinute} {t.ratePerMin} (Simulated every 10s)</span>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-950/50 rounded text-slate-700 font-mono">
                <Coins className="w-3 h-3" />
                <span>Deducted: {accumulatedDeductions}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar inside reader */}
      {!pdfUrl && (
        <div className="px-4 py-2 bg-slate-100/80 border-b border-slate-200 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search text within current chapter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs w-full focus:outline-none text-slate-700"
            id="reader-search-input"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-[10px] text-slate-500 hover:text-slate-900"
              id="reader-search-clear"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Book overall statistics ribbon */}
      {!pdfUrl && (
        <div className="bg-amber-100/30 border-b border-amber-200/50 px-4 py-2.5 flex flex-wrap gap-4 items-center justify-between text-[11px] font-sans font-bold text-slate-800">
          <div className="flex flex-wrap items-center gap-2 text-orange-950">
            <span className="text-xs">📖 గ్రంథ వివరాలు:</span>
            <span className="bg-orange-100/80 text-orange-950 px-2.5 py-1 rounded-md border border-orange-200/80 shadow-xs">
              📝 {getTotalCharacters().toLocaleString()} అక్షరాలు (Letters)
            </span>
            <span className="bg-amber-100/80 text-amber-950 px-2.5 py-1 rounded-md border border-amber-200/80 shadow-xs">
              🔠 {getTotalWords().toLocaleString()} పదాలు (Words)
            </span>
          </div>
          <div className="text-slate-500 font-mono text-[10px] bg-slate-200/60 px-2 py-0.5 rounded border border-slate-300/40">
            విభాగం: {book.category}
          </div>
        </div>
      )}

      {/* Book Body - Styled as white paper pages */}
      <div className={`flex-1 overflow-y-auto relative scroll-smooth ${pdfUrl ? 'py-4 px-2 bg-slate-950/90' : 'px-2 sm:px-4 py-6 bg-slate-200/40'}`}>
        <div className={`mx-auto ${pdfUrl ? 'w-full h-full' : 'max-w-4xl space-y-6'}`}>
          {/* Main Book Cover Card */}
          {(book.coverUrl || book.coverImage) && activePageIndex === 0 && !pdfUrl && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200">
               <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Book Cover</span>
                  <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">PDF Mode</div>
               </div>
               <div className="flex flex-col items-center py-10 px-6">
                <img 
                  src={book.coverUrl || book.coverImage} 
                  alt={book.title} 
                  className="w-48 h-64 sm:w-64 sm:h-80 object-cover rounded shadow-2xl border-4 border-white mb-6"
                  referrerPolicy="no-referrer"
                />
                <h2 className="text-xl font-bold text-slate-900 text-center mb-2">{book.title}</h2>
                <p className="text-sm text-slate-500 mb-6">{book.author}</p>
                <div className="flex items-center gap-3 text-[11px] font-bold bg-slate-50 border border-slate-100 px-4 py-2 rounded-full text-slate-500">
                  <span>📄 {book.pageCount || totalPages} Pages</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  <span>💾 {book.fileSizeMb || (Math.random() * 5 + 1).toFixed(1)} MB</span>
                </div>
              </div>
            </div>
          )}

          {/* Individual Page View or Minimal Native Touch-Scroll PDF Viewer & PDF.js Engine */}
          {pdfUrl ? (
            /* Minimal Clean PDF Reader Container - 20% Width Reduced (80% / max-w-4xl), Native Iframe & Canvas Engine */
            <div 
              id="minimal-pdf-viewer-root" 
              className="w-full max-w-[80%] mx-auto h-[calc(100vh-60px)] flex flex-col bg-white rounded-xl shadow-lg border border-slate-300 overflow-hidden"
            >
              {/* Minimal PDF Bar: Title, MB size, Page Navigation & Small Download Button */}
              <div className="px-4 py-2 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-sm truncate text-slate-100" title={book.title}>
                    {book.title}
                  </span>
                  <span className="text-xs text-slate-400 shrink-0 font-mono bg-slate-800 px-2 py-0.5 rounded">
                    {book.fileSizeMb ? `${book.fileSizeMb} MB` : 'PDF'}
                  </span>
                </div>
                
                {/* PDF Page Navigation & Zoom Controls */}
                <div className="flex items-center gap-2">
                  {pdfDoc && (
                    <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 px-2 py-0.5 rounded text-xs font-mono text-slate-300">
                      <button 
                        onClick={() => setActivePageIndex(p => Math.max(0, p - 1))}
                        disabled={activePageIndex === 0}
                        className="hover:text-white disabled:opacity-30"
                        title="Previous Page"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span>{activePageIndex + 1} / {pdfDoc.numPages}</span>
                      <button 
                        onClick={() => setActivePageIndex(p => Math.min(pdfDoc.numPages - 1, p + 1))}
                        disabled={activePageIndex === pdfDoc.numPages - 1}
                        className="hover:text-white disabled:opacity-30"
                        title="Next Page"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {pdfDoc && (
                    <div className="hidden sm:flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded text-xs text-slate-300">
                      <button 
                        onClick={() => setPdfScale(s => Math.max(0.75, s - 0.15))}
                        className="hover:text-white p-0.5"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setPdfScale(s => Math.min(2.5, s + 0.15))}
                        className="hover:text-white p-0.5"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <a 
                    href={pdfUrl} 
                    download 
                    className="flex items-center gap-1.5 px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-md shadow-xs transition active:scale-95 shrink-0"
                    id="pdf-download-btn"
                    title="Download PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>డౌన్లోడ్</span>
                  </a>
                </div>
              </div>
              
              {/* Native Iframe & Canvas Rendering Display Container */}
              <div className="flex-1 w-full h-full relative bg-slate-100 overflow-auto flex flex-col items-center justify-start p-2">
                {pdfLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
                    <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <span className="text-xs font-semibold text-slate-600">PDF లోడ్ అవుతోంది...</span>
                  </div>
                )}

                {/* Robust Native iframe Viewer - Best for AI Studio Preview & Mobile */}
                <iframe
                  id="pdf-native-viewer"
                  src={pdfUrl.includes('#') ? pdfUrl : `${pdfUrl}#toolbar=1&navpanes=0`}
                  className="w-full h-full min-h-[750px] border-0 rounded bg-white shadow-xs"
                  title="PDF Viewer"
                />

                {/* PDF.js Canvas Fallback / High-Definition Page Renderer */}
                {pdfDoc && (
                  <div className="mt-4 flex flex-col items-center max-w-full overflow-auto">
                    <canvas ref={canvasRef} className="shadow-md rounded border border-slate-200 bg-white max-w-full" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <motion.div 
              key={`${activeChapterIndex}-${activePageIndex}`}
              initial={{ rotateY: -30, opacity: 0, transformOrigin: "left center" }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 30, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-white rounded shadow-sm border border-slate-200 min-h-[800px] flex flex-col relative overflow-hidden perspective-1000"
            >
              {/* Page Internal Header */}
              <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                   <FileText className="w-4 h-4 text-slate-400" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[200px]">
                     {book.title}
                   </span>
                </div>
                <div className="text-[10px] font-bold text-slate-400">
                  PAGE {activePageIndex + 1}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-8 sm:p-12 flex-1 flex flex-col">
                 {/* Chapter Heading (if page 1) */}
                 {activePageIndex === 0 && (
                    <div className="text-center mb-12">
                       <h1 className="text-2xl font-serif font-bold text-slate-900 mb-4">
                          {currentChapter?.title || book.title}
                       </h1>
                       <div className="h-0.5 w-16 bg-amber-200 mx-auto" />
                    </div>
                 )}

                 <div className="prose prose-slate max-w-none select-text">
                    {activeParagraphs.map((p, i) => renderParagraph(p, i))}
                 </div>
              </div>

              {/* Page Footer */}
              <div className="px-8 py-4 border-t border-slate-50 text-center text-[10px] font-bold text-slate-300">
                 {activePageIndex + 1}
              </div>
            </motion.div>
          )}

          {/* Internal Page Pagination (Only for text books, NOT for PDF books) */}
          {(!pdfUrl && allParagraphsCount > 0) && (
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-200/50">
               <button 
                  onClick={() => {
                    setActivePageIndex(p => Math.max(0, p - 1));
                    document.querySelector('.overflow-y-auto')?.scrollTo(0, 0);
                  }}
                  disabled={activePageIndex === 0}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition ${theme === 'dark' ? 'bg-slate-800 text-slate-300 disabled:opacity-30' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-30'}`}
               >
                 <ChevronLeft className="w-4 h-4" /> క్రితం పేజీ (Prev)
               </button>
               <span className={`text-xs font-mono font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                 Page {activePageIndex + 1} of {totalPages}
               </span>
               <button 
                  onClick={() => {
                    setActivePageIndex(p => Math.min(totalPages - 1, p + 1));
                    document.querySelector('.overflow-y-auto')?.scrollTo(0, 0);
                  }}
                  disabled={activePageIndex === totalPages - 1}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition ${theme === 'dark' ? 'bg-slate-800 text-slate-300 disabled:opacity-30' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-30'}`}
               >
                 తర్వాత పేజీ (Next) <ChevronRight className="w-4 h-4" />
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Reader footer navigation */}
      {!pdfUrl && (
        <footer className="bg-white border-t border-slate-200 px-4 py-3 flex justify-between items-center z-10">
          <button
            disabled={activeChapterIndex === 0}
            onClick={() => {
              setActiveChapterIndex(prev => Math.max(0, prev - 1));
              document.querySelector('.overflow-y-auto')?.scrollTo(0, 0);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
            id="prev-chapter-btn"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev Chapter</span>
          </button>

          <span className="text-xs font-serif text-slate-500">
            Chapter {activeChapterIndex + 1} of {book.chapters ? book.chapters.length : 1}
          </span>

          <button
            disabled={!book.chapters || book.chapters.length === 0 || activeChapterIndex === book.chapters.length - 1}
            onClick={() => {
              setActiveChapterIndex(prev => Math.min(book.chapters ? book.chapters.length - 1 : 0, prev + 1));
              document.querySelector('.overflow-y-auto')?.scrollTo(0, 0);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition"
            id="next-chapter-btn"
          >
            <span>Next Chapter</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      )}
    </div>
  );
}
