import React from 'react';
import { 
  Coins, Plus, ArrowUpRight, History, HelpCircle, AlertCircle, 
  BookOpen, Clock, Award, CheckCircle2, ChevronRight
} from 'lucide-react';
import { CreditTransaction, LanguageCode, TRANSLATIONS } from '../types';

interface PricingPanelProps {
  credits: number;
  transactions: CreditTransaction[];
  onTopUp: (amount: number, packName: string) => void;
  currentLanguage: LanguageCode;
}

export default function PricingPanel({
  credits,
  transactions,
  onTopUp,
  currentLanguage
}: PricingPanelProps) {
  const t = TRANSLATIONS[currentLanguage];

  const packs = [
    { name: 'చదివే పాస్ (Reading Pass)', amount: 100, cost: '₹10', description: 'ఆన్‌లైన్‌లో చదవడానికి అనువైనది.', tag: 'UPI Scan' },
    { name: 'రీడర్ గోల్డ్ (Reader Gold)', amount: 500, cost: '₹29', description: 'పుస్తకాలు & ఈబుక్స్ డౌన్‌లోడ్ కోసం.', tag: 'Best Value' },
    { name: 'స్కాలర్ ప్రో (Scholar Pro)', amount: 1200, cost: '₹99', description: 'అపరిమిత రీడింగ్ మరియు డౌన్‌లోడ్స్.', tag: 'Popular' }
  ];

  return (
    <div className="bg-orange-50 border-l border-orange-300 text-slate-900 p-4 h-full flex flex-col">
      {/* Credits Banner */}
      <div className="bg-gradient-to-r from-orange-950/60 to-amber-950/60 border border-orange-500/30 rounded-2xl p-4 mb-5 shadow-lg">
        <span className="text-[10px] uppercase tracking-widest text-orange-400 font-bold block mb-1">{t.credits}</span>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-slate-700 animate-pulse" />
            <span className="text-2xl font-mono font-bold text-slate-900">{credits}</span>
          </div>
          <span className="text-xs text-slate-800 font-mono">Universal Credits</span>
        </div>
      </div>

      {/* Top up packs */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700/80 mb-3 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-orange-400" />
          <span>{t.topup}</span>
        </h4>

        <div className="space-y-2.5">
          {packs.map((pack) => (
            <div 
              key={pack.name}
              className="bg-orange-100 border border-orange-300 hover:border-orange-500/50 p-3 rounded-xl flex items-center justify-between transition-all group shadow-sm"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-900">{pack.name}</span>
                  {pack.tag && (
                    <span className="text-[9px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest border border-orange-500/30">
                      {pack.tag}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-900/60">{pack.description}</p>
                <div className="text-slate-700 text-xs font-mono font-bold">+{pack.amount} Credits</div>
              </div>

              <button
                onClick={() => onTopUp(pack.amount, pack.name)}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-900 font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow-md active:scale-95"
                id={`topup-pack-${pack.name.toLowerCase().replace(' ', '-')}`}
              >
                <span>{pack.cost}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Reading Session Rates */}
      <div className="bg-orange-100/70 border border-orange-300 rounded-xl p-3 mb-6 space-y-2">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-900/80 uppercase">
          <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
          <span>How It Works</span>
        </div>
        <ul className="text-[10px] text-slate-800/70 space-y-1.5 list-disc pl-4 font-sans leading-relaxed">
          <li><strong>Unlock Books</strong>: Unlock specific classic/AI books with a one-time credit payment.</li>
          <li><strong>Reading Session</strong>: Deducts 1 to 3 credits per minute depending on book complexity during an active session.</li>
          <li><strong>Daily Reward</strong>: Open the app every day to claim bonus credits!</li>
        </ul>
      </div>

      {/* Transaction History */}
      <div className="flex-1 flex flex-col min-h-0">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700/80 mb-2.5 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-orange-400" />
          <span>{t.transactionHistory}</span>
        </h4>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0 font-sans">
          {transactions.map((tx) => {
            const isNegative = tx.amount < 0;
            return (
              <div 
                key={tx.id} 
                className="bg-orange-100/50 border border-orange-300 p-2.5 rounded-xl flex items-start justify-between text-[11px]"
              >
                <div className="space-y-0.5 max-w-[70%]">
                  <div className="font-semibold text-slate-900 line-clamp-1">{tx.description}</div>
                  <div className="text-[9px] text-slate-700/50 font-mono">{tx.timestamp}</div>
                </div>
                <div className={`font-mono font-bold shrink-0 text-right ${isNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isNegative ? '' : '+'}{tx.amount}
                </div>
              </div>
            );
          })}

          {transactions.length === 0 && (
            <div className="text-center py-6 text-slate-700/50 text-[11px] font-mono">
              No transactions yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
