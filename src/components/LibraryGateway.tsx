import React, { useState } from 'react';
import { Search, Globe, ArrowLeft, BookOpen, ShieldCheck, Download, Loader2, Settings2, X, Check } from 'lucide-react';

const LIBRARY_CONFIG = [
  { id: 'gutenberg', name: 'Project Gutenberg', url: 'https://www.gutenberg.org/ebooks/search/?query=' },
  { id: 'openlibrary', name: 'Open Library', url: 'https://openlibrary.org/search?q=' },
  { id: 'manybooks', name: 'ManyBooks', url: 'https://manybooks.net/search-book?search=' },
  { id: 'standardebooks', name: 'Standard Ebooks', url: 'https://standardebooks.org/ebooks?query=' },
  { id: 'archive', name: 'Internet Archive', url: 'https://archive.org/details/texts?query=' }
];

interface LibraryGatewayProps {
  onClose?: () => void;
  onBookSaved?: (bookData: any) => void;
  localBooks: any[];
}

export default function LibraryGateway({ onClose, onBookSaved, localBooks }: LibraryGatewayProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showBrowser, setShowBrowser] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [enabledSources, setEnabledSources] = useState<string[]>(['gutenberg']);
  const [showSettings, setShowSettings] = useState(false);

  const toggleSource = (id: string) => {
    setEnabledSources(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id) 
        : [...prev, id]
    );
  };

  const librarySources = [
    { name: 'Project Gutenberg' },
    { name: 'Open Library' },
    { name: 'ManyBooks' },
    { name: 'Standard Ebooks' },
    { name: 'Internet Archive' }
  ];

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // STEP 1: Local Check
    const existsLocally = localBooks.find(b => 
      b.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (existsLocally) {
      alert(`✅ "${existsLocally.title}" మన లోకల్ లైబ్రరీలోనే ఉంది!`);
      if (onClose) onClose();
      return;
    }

    // STEP 2: Pick the first enabled source
    const activeSourceId = enabledSources[0];
    const sourceConfig = LIBRARY_CONFIG.find(s => s.id === activeSourceId) || LIBRARY_CONFIG[0];
    
    const targetUrl = `${sourceConfig.url}${encodeURIComponent(searchQuery)}`;
    setCurrentUrl(targetUrl);
    setShowBrowser(true);
  };

  const handleSimulateDownloadAndSave = () => {
    // STEP 4 & 5: Payment & Dual Download/Auto-save
    setIsProcessing(true);
    
    // Simulating the cycle as described by Admin
    setTimeout(() => {
      const newBook = {
        title: searchQuery || 'New International Discovery',
        author: 'International Author',
        description: `Downloaded via Smart Gateway from ${currentUrl}`,
        category: 'General',
        isUnlocked: true,
        coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800'
      };

      if (onBookSaved) onBookSaved(newBook);
      alert("✅ పేమెంట్ సక్సెస్! బుక్ మీ ఫోన్లోకి మరియు మన లైబ్రరీలోకి పర్మినెంట్గా సేవ్ అయింది.");
      
      // STEP 6: Return to Chat
      setIsProcessing(false);
      if (onClose) onClose();
    }, 2000);
  };

  if (showBrowser) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col">
        {/* WHITE-LABEL TOP BAR */}
        <div className="bg-[#1a237e] text-white px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-orange-400" />
            <span className="font-bold text-sm tracking-tight">📚 Old Treasury - Smart Library Gateway</span>
          </div>
          <button 
            onClick={() => setShowBrowser(false)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition shadow-md active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            తిరిగి వెళ్లు (Back)
          </button>
        </div>

        {/* SECURITY & STATUS BAR */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-1.5 flex items-center gap-2 overflow-hidden">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-[10px] text-slate-500 truncate font-mono">Secure Tunnel: {currentUrl}</span>
        </div>

          {/* INTERNATIONAL LIBRARY IFRAME */}
          <div className="flex-1 bg-slate-200 relative">
            <iframe 
              src={currentUrl} 
              className="w-full h-full border-none"
              title="International Library Browser"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
            
            {/* ACTION FLOATER FOR DUAL DOWNLOAD & SAVE */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
              <button 
                onClick={handleSimulateDownloadAndSave}
                disabled={isProcessing}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black text-sm shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 border-4 border-white/20 backdrop-blur-sm disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>ప్రోసెస్ అవుతోంది (Processing...)</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>పేమెంట్ చేసి డౌన్లోడ్ & లైబ్రరీకి సేవ్ చెయ్</span>
                  </>
                )}
              </button>
            </div>
          </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/40 backdrop-blur-sm rounded-3xl border-2 border-dashed border-orange-200 min-h-[300px] text-center">
      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
        <Globe className="w-10 h-10 text-orange-600 animate-pulse" />
        <button 
          onClick={() => setShowSettings(true)}
          className="absolute -left-2 -top-2 w-8 h-8 bg-white border-2 border-orange-200 rounded-full flex items-center justify-center text-orange-600 shadow-md hover:bg-orange-50 transition-colors z-10"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="w-full max-w-xs bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <span className="font-black text-slate-900 text-sm">లైబ్రరీ సెట్టింగ్స్</span>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {LIBRARY_CONFIG.map(lib => (
                <button 
                  key={lib.id}
                  onClick={() => toggleSource(lib.id)}
                  className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${
                    enabledSources.includes(lib.id) 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-slate-100 bg-slate-50 opacity-60'
                  }`}
                >
                  <span className={`text-xs font-bold ${enabledSources.includes(lib.id) ? 'text-orange-900' : 'text-slate-500'}`}>
                    {lib.name}
                  </span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    enabledSources.includes(lib.id) ? 'bg-orange-500 text-white' : 'bg-slate-200 text-transparent'
                  }`}>
                    <Check className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 bg-slate-50">
              <button 
                onClick={() => setShowSettings(false)}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-xs"
              >
                ఓకే (Done)
              </button>
            </div>
          </div>
        </div>
      )}
      
      <h3 className="text-xl font-black text-slate-900 mb-2">📚 Old Treasury Chat Console</h3>
      <p className="text-sm text-slate-600 mb-8 max-w-sm">
        మన లోకల్ లైబ్రరీలో లేని పుస్తకాల కోసం ప్రపంచవ్యాప్త ఇంటర్నేషనల్ లైబ్రరీ గేట్‌వే ద్వారా వెతకండి.
      </p>

      <div className="w-full max-w-md flex flex-col gap-3">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="ఏ పుస్తకం కావాలి? (Search for books...)"
            className="w-full bg-white border-2 border-slate-200 focus:border-orange-500 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all"
          />
        </div>
        
        <button 
          onClick={handleSearch}
          className="w-full bg-slate-900 hover:bg-orange-600 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group"
        >
          సెర్చ్ చేయి (Search International Library)
          <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {LIBRARY_CONFIG.map(src => (
          <div 
            key={src.id} 
            className={`flex items-center gap-1.5 transition-all cursor-default ${
              enabledSources.includes(src.id) ? 'opacity-100' : 'opacity-20 grayscale'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${enabledSources.includes(src.id) ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <span className="text-[10px] font-bold text-slate-500">{src.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
