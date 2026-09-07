import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, QrCode, Smartphone, CheckCircle2, ShieldCheck, Download, 
  BookOpen, Copy, Check, ArrowRight, Sparkles, RefreshCw, AlertCircle
} from 'lucide-react';
import { Book, LanguageCode, TRANSLATIONS } from '../types';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  mode: 'read' | 'download';
  onSuccess: (book: Book, mode: 'read' | 'download') => void;
  currentLanguage: LanguageCode;
  readPrice?: number;
  downloadPrice?: number;
  upiId?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  book,
  mode: initialMode,
  onSuccess,
  currentLanguage,
  readPrice = 10,
  downloadPrice = 29,
  upiId = 'psm8742260@upi'
}) => {
  const [selectedMode, setSelectedMode] = useState<'read' | 'download'>(initialMode || 'read');
  const [isCopied, setIsCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !book) return null;

  const t = TRANSLATIONS[currentLanguage];
  const amount = selectedMode === 'read' ? readPrice : downloadPrice;
  const upiPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=AllInOneLibrary&am=${amount}&cu=INR&tn=${encodeURIComponent(`Payment for ${book.title} (${selectedMode === 'read' ? 'Reading Pass' : 'Download PDF'})`)}`;
  const customAdminQr = localStorage.getItem('library_admin_qr_image');
  const qrCodeImageUrl = customAdminQr || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiPayload)}&color=0f172a&bgcolor=ffffff&margin=8`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleVerifyPayment = () => {
    setIsVerifying(true);
    setErrorMsg(null);

    // Simulate instant verification & registration
    setTimeout(() => {
      setIsVerifying(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        onSuccess(book, selectedMode);
        setPaymentSuccess(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-orange-900/20 backdrop-blur-md flex items-start justify-center pt-3 sm:pt-6 p-2 sm:p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="bg-orange-100 border border-orange-400 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-900 my-auto sm:my-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-orange-50 border-b border-orange-300">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-orange-600 to-amber-600 rounded-xl shadow-md">
              <QrCode className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>UPI QR కోడ్ చెల్లింపు (Scan & Pay)</span>
              </h3>
              <p className="text-[10px] text-slate-800">PhonePe / Google Pay / Paytm / BHIM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-700 hover:text-slate-950 hover:bg-orange-300 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {paymentSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-base font-bold text-slate-900">చెల్లింపు విజయవంతమైంది!</h4>
            <p className="text-xs text-slate-800">
              "{book.title}" {selectedMode === 'read' ? 'చదవడానికి సిద్ధంగా ఉంది' : 'డౌన్‌లోడ్ అవుతోంది'}.
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Book Info Summary */}
            <div className="bg-orange-100 border border-orange-300 rounded-xl p-3 flex items-center gap-3">
              <div className="w-12 h-14 bg-orange-200 rounded-lg overflow-hidden shrink-0 border border-orange-200">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700/60">
                    <BookOpen className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{book.title}</h4>
                <p className="text-[10px] text-slate-900/60 truncate">రచయిత: {book.author || 'AI Scholar'}</p>
                <span className="inline-block mt-1 text-[9px] bg-orange-500/20 text-orange-300 font-mono px-2 py-0.5 rounded-full border border-orange-500/30">
                  {book.category || 'General'}
                </span>
              </div>
            </div>

            {/* Mode Selection Tabs (Read Online vs Download PDF) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMode('read')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  selectedMode === 'read'
                    ? 'bg-orange-600/20 border-orange-500 shadow-md text-slate-900'
                    : 'bg-orange-100 border-orange-300 text-slate-800 hover:border-orange-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <BookOpen className={`w-4 h-4 ${selectedMode === 'read' ? 'text-orange-400' : 'text-slate-9000/50'}`} />
                  <span className="text-xs font-bold font-mono text-emerald-400">₹{readPrice}</span>
                </div>
                <div className="text-[11px] font-bold">ఆన్‌లైన్‌లో చదవండి</div>
                <div className="text-[9px] text-slate-900/60">రీడర్ యాక్సెస్</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode('download')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  selectedMode === 'download'
                    ? 'bg-amber-600/20 border-orange-400 shadow-md text-slate-900'
                    : 'bg-orange-100 border-orange-300 text-slate-800 hover:border-orange-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Download className={`w-4 h-4 ${selectedMode === 'download' ? 'text-slate-700' : 'text-slate-9000/50'}`} />
                  <span className="text-xs font-bold font-mono text-slate-700">₹{downloadPrice}</span>
                </div>
                <div className="text-[11px] font-bold">పీడీఎఫ్ డౌన్‌లోడ్</div>
                <div className="text-[9px] text-slate-900/60">ఆఫ్‌లైన్ కాపీ</div>
              </button>
            </div>

            {/* QR Code Section */}
            <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg">
              <img
                src={qrCodeImageUrl}
                alt="UPI QR Code"
                className="w-44 h-44 rounded-lg object-contain border border-slate-200"
              />
              <div className="mt-2 text-center">
                <span className="text-xs font-mono font-extrabold text-slate-900">
                  చెల్లించవలసిన మొత్తం: ₹{amount}
                </span>
                <p className="text-[10px] text-slate-600 font-sans">
                  ఏదైనా UPI యాప్ ద్వారా స్కాన్ చేసి చెల్లించండి
                </p>
              </div>
            </div>

            {/* UPI ID Copy Bar */}
            <div className="flex items-center justify-between bg-orange-100 border border-orange-300 px-3.5 py-2 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-mono text-[11px]">
                <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                <span>UPI ID: <strong>{upiId}</strong></span>
              </div>
              <button
                type="button"
                onClick={handleCopyUPI}
                className="text-[10px] bg-orange-300 hover:bg-orange-400 text-slate-800 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'కాపీ అయింది' : 'కాపీ'}</span>
              </button>
            </div>

            {/* Optional UTR / Reference ID & Verify Button */}
            <div className="space-y-2">
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="UTR / ట్రాన్సాక్షన్ ID నమోదు చేయండి (ఐచ్ఛికం)"
                className="w-full bg-orange-100 border border-orange-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-amber-400/40 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
              />

              {errorMsg && (
                <div className="flex items-center gap-1.5 text-rose-400 text-xs bg-rose-500/10 p-2 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleVerifyPayment}
                disabled={isVerifying}
                className="w-full bg-gradient-to-r from-orange-600 via-amber-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 active:scale-95 text-slate-900 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>చెల్లింపు సరిచూస్తున్నాము...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>చెల్లించాను (Verify & Unlock ₹{amount})</span>
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> 100% సురక్షితమైన నేరుగా బ్యాంక్ UPI ట్రాన్స్‌ఫర్
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
export default PaymentModal;
