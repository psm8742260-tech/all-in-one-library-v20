import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Type as FontIcon, 
  Search, Info, Clock, Coins, Lock, Sparkles, CheckCircle2, Play, Square, ZoomIn, ZoomOut,
  Mic, Film, Music, Volume2, Video
} from 'lucide-react';
import { Book, LanguageCode, TRANSLATIONS } from '../types';

interface ReaderProps {
  book: Book;
  credits: number;
  onClose: () => void;
  onDeductCredits: (amount: number, description: string) => void;
  currentLanguage: LanguageCode;
}

export default function Reader({ book, credits, onClose, onDeductCredits, currentLanguage }: ReaderProps) {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [fontSize, setFontSize] = useState<number>(18); // default size px
  const [searchQuery, setSearchQuery] = useState('');
  const [isReadingSessionActive, setIsReadingSessionActive] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [accumulatedDeductions, setAccumulatedDeductions] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const t = TRANSLATIONS[currentLanguage];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentChapter = book.chapters[activeChapterIndex] || book.chapters[0];

  // Text to speech narration toggle
  const toggleSpeechNarration = () => {
    if (!('speechSynthesis' in window)) {
      alert('ఆడియో స్పీచ్ సదుపాయం అందుబాటులో లేదు.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = `${currentChapter.title}. ${currentChapter.content}`;
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

  // Split text into paragraphs for cleaner reading
  const paragraphs = currentChapter?.content?.split('\n\n') || [];

  // Highlight search words
  const renderParagraph = (text: string, index: number) => {
    if (!searchQuery) {
      return <p key={index} style={{ fontSize: `${fontSize}px` }} className="text-slate-800 leading-relaxed font-serif mb-5">{text}</p>;
    }

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);

    return (
      <p key={index} style={{ fontSize: `${fontSize}px` }} className="text-slate-800 leading-relaxed font-serif mb-5">
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

  return (
    <div className="flex flex-col h-full bg-amber-50/70 text-slate-900 relative">
      {/* Reader header */}
      <header className="flex justify-between items-center px-4 py-3 bg-white border-b border-slate-200 shadow-xs z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="group flex items-center gap-1.5 p-1 px-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 transition-all active:scale-90"
            id="reader-back-btn"
            title="Go back to Library"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-bold pr-0.5">Back</span>
          </button>
          <div>
            <h3 className="font-serif font-bold text-sm text-slate-950 line-clamp-1">{book.title}</h3>
            <p className="text-xs text-slate-500 line-clamp-1">{book.author}</p>
          </div>
        </div>

        {/* Action controllers */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Universal Audio/Speaker Narration Button */}
          <button
            onClick={toggleSpeechNarration}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition border shadow-xs ${
              isSpeaking
                ? 'bg-amber-500 text-slate-950 border-orange-400 animate-pulse'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
            }`}
            title="స్పీకర్‌లో అధ్యాయం వినండి (Listen via Speaker)"
            id="reader-speaker-narration-btn"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">{isSpeaking ? 'ఆపు' : 'వినండి'}</span>
          </button>

          {/* Font Controls */}
          <button 
            onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
            title="Decrease size"
            id="font-decrease-btn"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setFontSize(prev => Math.min(26, prev + 2))}
            className="p-1.5 hover:bg-slate-100 rounded text-slate-600"
            title="Increase size"
            id="font-increase-btn"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Session Controller */}
          <button
            onClick={() => {
              if (isReadingSessionActive) {
                setIsReadingSessionActive(false);
              } else {
                if (credits < book.costPerMinute) {
                  alert(t.insufficientCredits);
                } else {
                  setIsReadingSessionActive(true);
                }
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition ${
              isReadingSessionActive 
                ? 'bg-red-500 text-slate-900 hover:bg-red-600' 
                : 'bg-emerald-600 text-slate-900 hover:bg-emerald-700'
            }`}
            id="reading-session-toggle"
          >
            {isReadingSessionActive ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t.stopReading}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t.startReading}</span>
              </>
            )}
          </button>
        </div>
      </header>

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

      {/* Book Body */}
      <div className="flex-1 overflow-y-auto px-6 py-8 relative">
        <div className="max-w-2xl mx-auto">
          {/* Chapter Heading */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-slate-400">
                {book.category}
              </span>
              {(book.contentType === 'audio' || currentChapter?.audioUrl) && (
                <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-purple-200">
                  <Mic className="w-3 h-3" /> వాయిస్ కథ (Audio)
                </span>
              )}
              {(book.contentType === 'video' || currentChapter?.videoUrl) && (
                <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-rose-200">
                  <Film className="w-3 h-3" /> వీడియో కథ (Video)
                </span>
              )}
            </div>

            <h1 className="text-2xl font-serif font-bold text-slate-900 mt-1 mb-4">
              {currentChapter?.title || 'Unknown Chapter'}
            </h1>
            <div className="h-0.5 w-16 bg-amber-200 mx-auto" />
          </div>

          {/* Audio Story Player */}
          {(book.audioUrl || currentChapter?.audioUrl) && (
            <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="p-2 bg-purple-600 text-slate-900 rounded-xl shadow">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-purple-950">వాయిస్ కథ వినండి (Play Voice Audio)</h4>
                  <p className="text-[11px] text-purple-700">రచయిత వాయిస్ రికార్డింగ్</p>
                </div>
              </div>
              <audio 
                src={currentChapter?.audioUrl || book.audioUrl} 
                controls 
                className="w-full h-10"
              />
            </div>
          )}

          {/* Video Story Player */}
          {(book.videoUrl || currentChapter?.videoUrl) && (
            <div className="mb-8 p-4 bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="p-2 bg-rose-600 text-slate-900 rounded-xl shadow">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-950">వీడియో కథను వీక్షించండి (Watch Video Story)</h4>
                  <p className="text-[11px] text-rose-700">రచయిత వీడియో కథనం</p>
                </div>
              </div>
              <video 
                src={currentChapter?.videoUrl || book.videoUrl} 
                controls 
                className="w-full max-h-80 rounded-xl bg-orange-100 shadow-md object-contain"
              />
            </div>
          )}

          {/* Chapter Text */}
          <div className="prose select-text">
            {paragraphs.map((p, i) => renderParagraph(p, i))}
          </div>

          {/* If there is no chapter text */}
          {paragraphs.length === 0 && !book.audioUrl && !book.videoUrl && (
            <div className="text-center py-12 text-slate-400 font-serif">
              No text content available for this chapter.
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
          Chapter {activeChapterIndex + 1} of {book.chapters.length}
        </span>

        <button
          disabled={activeChapterIndex === book.chapters.length - 1}
          onClick={() => {
            setActiveChapterIndex(prev => Math.min(book.chapters.length - 1, prev + 1));
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
