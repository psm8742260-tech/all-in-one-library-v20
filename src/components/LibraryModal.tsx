import React from 'react';
import { motion } from 'motion/react';
import { 
  X, Globe, Grid, BookOpen, Sparkles, Folder, ShieldCheck, 
  Coins, Download, Compass, Layers, CheckCircle2 
} from 'lucide-react';
import { LanguageCode, TRANSLATIONS, User, Folder as FolderType } from '../types';
// @ts-ignore
import appLogoImg from '../assets/images/app_logo_icon_1787974156637.jpg';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onOpenAdminPanel: () => void;
  user: User;
  folders: FolderType[];
  activeFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export const CATEGORIES = [
  { id: 'Culture & Heritage', labelKey: 'cultureHeritage', icon: '🏛️', color: 'from-amber-500/20 to-orange-500/10 border-orange-400 text-slate-900' },
  { id: 'Technology & Science', labelKey: 'techScience', icon: '🔬', color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-300' },
  { id: 'Kids & Education', labelKey: 'kidsEducation', icon: '🎓', color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300' },
  { id: 'Mantras & Spirituality', labelKey: 'mantrasSpirituality', icon: '🕉️', color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-300' },
  { id: 'Literature & Novels', labelKey: 'literatureNovels', icon: '📖', color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-300' }
];

export const ALL_INDIA_LANGUAGES: { code: LanguageCode; name: string; native: string; flag: string }[] = [
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'en', name: 'English', native: 'English', flag: '🌐' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' }
];

export default function LibraryModal({
  isOpen,
  onClose,
  currentLanguage,
  onLanguageChange,
  selectedCategory,
  onSelectCategory,
  onOpenAdminPanel,
  user,
  folders,
  activeFolderId,
  onSelectFolder
}: LibraryModalProps) {
  if (!isOpen) return null;

  const t = TRANSLATIONS[currentLanguage];
  const isAdmin = user.email.toLowerCase() === 'psm8742260@gmail.com' || user.email.toLowerCase() === 'sim_8466062260@sim-auth.library';

  return (
    <div className="fixed inset-0 bg-orange-900/20 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 animate-fade-in select-none">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-orange-100 border border-orange-300 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-900"
      >
        {/* Header */}
        <div className="p-4 bg-orange-50 border-b border-orange-300 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-200 border border-orange-400 shrink-0 shadow-md">
              <img 
                src={appLogoImg} 
                alt="All in One Library Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base tracking-wide flex items-center gap-2">
                <span>{t.libraryBtn || 'లైబ్రరీ హబ్'}</span>
                <span className="text-[10px] bg-orange-500/20 text-orange-300 font-mono px-2 py-0.5 rounded-full border border-orange-500/30">
                  ALL-IN-ONE
                </span>
              </h3>
              <p className="text-[11px] text-slate-800 font-sans">
                భాష & కేటగిరీల ప్రకారం పుస్తకాలను ఎంచుకోండి
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-orange-300 text-slate-700 hover:text-slate-950 rounded-xl transition"
            id="close-library-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">

          {/* Section 1: All-India Regional Languages Switcher */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Globe className="w-4 h-4 text-orange-400" />
                <span>1. భారతీయ భాషల ఎంపిక (Regional Languages)</span>
              </span>
              <span className="text-[10px] text-slate-700/60 font-mono">11+ Languages</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {ALL_INDIA_LANGUAGES.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => onLanguageChange(lang.code)}
                    className={`p-2.5 rounded-xl border text-left transition duration-200 flex items-center justify-between ${
                      isSelected
                        ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-slate-900 border-orange-400 shadow-md'
                        : 'bg-orange-50 hover:bg-orange-200 text-slate-800 border-orange-300 hover:border-orange-400'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold font-serif flex items-center gap-1">
                        <span>{lang.flag}</span>
                        <span>{lang.native}</span>
                      </div>
                      <div className={`text-[9px] ${isSelected ? 'text-slate-900' : 'text-slate-700/60'}`}>
                        {lang.name}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Structured Category Filter Engine */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Grid className="w-4 h-4 text-slate-700" />
                <span>2. కేటగిరీల ఎంపిక (Hierarchical Category Filter)</span>
              </span>
              {selectedCategory && (
                <button 
                  onClick={() => onSelectCategory(null)}
                  className="text-[10px] text-orange-400 hover:underline font-mono"
                >
                  Reset Filter
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* All Categories Option */}
              <button
                onClick={() => {
                  onSelectCategory(null);
                  onClose();
                }}
                className={`p-3 rounded-xl border text-left transition duration-200 flex items-center gap-3 ${
                  selectedCategory === null
                    ? 'bg-orange-50 border-orange-500 ring-1 ring-orange-500 text-slate-900'
                    : 'bg-orange-50 hover:bg-orange-200 border-orange-300 text-slate-800'
                }`}
              >
                <div className="text-xl">📚</div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {t.allCategories}
                  </div>
                  <div className="text-[10px] text-slate-900/60">
                    అన్ని కేటగిరీల పుస్తకాలు
                  </div>
                </div>
              </button>

              {/* Individual Categories */}
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const localizedTitle = (t as any)[cat.labelKey] || cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border text-left transition duration-200 flex items-center gap-3 bg-gradient-to-r ${cat.color} ${
                      isSelected
                        ? 'ring-2 ring-orange-400 border-orange-400'
                        : 'hover:opacity-90'
                    }`}
                  >
                    <div className="text-xl">{cat.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">
                        {localizedTitle}
                      </div>
                      <div className="text-[10px] opacity-80 truncate font-mono">
                        {cat.id}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Dual Pricing & Download Rates */}
          <div className="bg-orange-50 p-3.5 rounded-xl border border-orange-300 space-y-2">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" />
              <span>{t.downloadRate} (Dual Pricing Engine)</span>
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-orange-100 p-2 rounded border border-orange-300">
                <span className="text-[9px] text-slate-800 block">చదివే రేటు (Reading Rate)</span>
                <span className="text-emerald-400 font-mono font-bold text-xs">1 - 2 Credits / Min</span>
              </div>
              <div className="bg-orange-100 p-2 rounded border border-orange-300">
                <span className="text-[9px] text-slate-800 block">అన్‌లాక్ రేటు (Unlock/Download)</span>
                <span className="text-slate-700 font-mono font-bold text-xs">20 - 50 Credits</span>
              </div>
            </div>
          </div>

          {/* Section 4: Folder Filter & Admin Settings */}
          <div className="pt-2 border-t border-orange-300 flex justify-between items-center text-xs">
            {isAdmin ? (
              <button
                onClick={() => {
                  onOpenAdminPanel();
                  onClose();
                }}
                className="bg-amber-200 hover:bg-amber-300 border-2 border-amber-400 text-black font-extrabold flex items-center gap-1.5 py-1.5 px-3 rounded-lg shadow-sm transition-all scale-100 hover:scale-105 active:scale-95"
              >
                <ShieldCheck className="w-4 h-4 text-black font-black" />
                <span className="text-black font-extrabold">అడ్మిన్ ప్యానెల్ (Admin Panel)</span>
                <span className="bg-amber-300 text-black border border-amber-400 font-extrabold px-1.5 py-0.5 rounded-full text-[9px]">
                  6606 Verified
                </span>
              </button>
            ) : (
              <div />
            )}

            <span className="text-[10px] text-slate-700/60 font-mono">
              User: {user.email}
            </span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
