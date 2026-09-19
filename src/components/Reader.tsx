import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Type as FontIcon, 
  Search, Info, Clock, Coins, Lock, Sparkles, CheckCircle2, Play, Square, ZoomIn, ZoomOut,
  Mic, Film, Music, Volume2, Video, Star, MoreVertical, FileText
} from 'lucide-react';
import { Book, LanguageCode, TRANSLATIONS } from '../types';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker path utilizing CDN for pure standard execution
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

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
  const pdfUrlMatch = 
    (typeof currentChapter?.content === 'string' && currentChapter.content.match(/(https?:\/\/|\/uploads\/)[^\s"']+\.pdf/i)) ||
    (typeof book.content === 'string' && book.content.match(/(https?:\/\/|\/uploads\/)[^\s"']+\.pdf/i)) ||
    (typeof book.text === 'string' && book.text.match(/(https?:\/\/|\/uploads\/)[^\s"']+\.pdf/i)) ||
    (typeof book.body === 'string' && book.body.match(/(https?:\/\/|\/uploads\/)[^\s"']+\.pdf/i)) ||
    (typeof book.description === 'string' && book.description.match(/(https?:\/\/|\/uploads\/)[^\s"']+\.pdf/i));

  const pdfUrl = pdfUrlMatch ? pdfUrlMatch[0] : null;

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

  // Load PDF Document when pdfUrl changes
  useEffect(() => {
    if (!pdfUrl) {
      setPdfDoc(null);
      return;
    }

    let isMounted = true;
    setPdfLoading(true);
    setPdfError(null);

    const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
    loadingTask.promise.then(
      (loadedPdf) => {
        if (!isMounted) return;
        setPdfDoc(loadedPdf);
        setPdfLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        console.error("Error loading PDF: ", err);
        setPdfError(err.message || "PDF లోడ్ చేయడంలో లోపం సంభవించింది.");
        setPdfLoading(false);
      }
    );

    return () => {
      isMounted = false;
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
    
    if (chapterText.trim() && !chapterText.includes('ఉదాహరణ కోసం ఉంచబడిన పాఠ్యం')) {
      rawContentString = chapterText;
    } else if (typeof book.content === 'string' && book.content.trim()) {
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
      <div className="absolute top-20 right-6 z-40 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg pointer-events-none">
        {activePageIndex + 1} / {totalPages}
      </div>

      {/* Sample Mode Golden Banner */}
      {book.isSampleMode && (
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
        {isReadingSessionActive && (
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

      {/* Book overall statistics ribbon */}
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

      {/* Book Body - Styled as white paper pages */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-6 relative scroll-smooth bg-slate-200/40">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main Book Cover Card */}
          {(book.coverUrl || book.coverImage) && activePageIndex === 0 && (
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

          {/* Individual Page View (Matches Screenshot Layout) */}
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
               {activePageIndex === 0 && !pdfUrl && (
                  <div className="text-center mb-12">
                     <h1 className="text-2xl font-serif font-bold text-slate-900 mb-4">
                        {currentChapter?.title || book.title}
                     </h1>
                     <div className="h-0.5 w-16 bg-amber-200 mx-auto" />
                  </div>
               )}

               {pdfUrl ? (
                 <div className="w-full flex-1 flex flex-col items-center select-none bg-slate-50/50 p-4 rounded-2xl border border-slate-100 shadow-inner z-10">
                   {pdfLoading && (
                     <div className="flex flex-col items-center justify-center py-20 gap-3">
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                       <span className="text-xs font-semibold text-slate-500">పుస్తకాన్ని లోడ్ చేస్తున్నాము, దయచేసి వేచి ఉండండి...</span>
                     </div>
                   )}
                   {pdfError && (
                     <div className="text-center py-16 text-red-500 font-medium">
                       {pdfError}
                     </div>
                   )}
                   
                   {!pdfLoading && !pdfError && (
                     <div className="w-full flex flex-col items-center">
                       {/* PDF Scale / Zoom Controllers */}
                       <div className="flex items-center gap-4 mb-4 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200 shadow-sm shrink-0 z-10">
                         <button 
                           onClick={() => setPdfScale(s => Math.max(0.6, s - 0.15))}
                           disabled={pdfScale <= 0.6}
                           className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded-full text-slate-600 transition flex items-center justify-center"
                           title="Zoom Out"
                         >
                           <ZoomOut className="w-4 h-4" />
                         </button>
                         <span className="text-xs font-mono font-bold text-slate-700 min-w-[40px] text-center">
                           {Math.round(pdfScale * 100)}%
                         </span>
                         <button 
                           onClick={() => setPdfScale(s => Math.min(2.5, s + 0.15))}
                           disabled={pdfScale >= 2.5}
                           className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded-full text-slate-600 transition flex items-center justify-center"
                           title="Zoom In"
                         >
                           <ZoomIn className="w-4 h-4" />
                         </button>
                       </div>

                       {/* Canvas PDF Viewer container */}
                       <div className="w-full overflow-x-auto py-2 flex justify-center bg-white border border-slate-200/60 rounded-xl shadow-xs">
                         <canvas 
                           ref={canvasRef} 
                           className="max-w-full shadow-lg rounded-sm border border-slate-100"
                         />
                       </div>
                     </div>
                   )}
                 </div>
               ) : (
                 <div className="prose prose-slate max-w-none select-text">
                    {activeParagraphs.map((p, i) => renderParagraph(p, i))}
                 </div>
               )}
            </div>

            {/* Page Footer */}
            <div className="px-8 py-4 border-t border-slate-50 text-center text-[10px] font-bold text-slate-300">
               {activePageIndex + 1}
            </div>
          </motion.div>

          {/* Internal Page Pagination */}
          {(allParagraphsCount > 0 || pdfUrl) && (
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
    </div>
  );
}
