import React, { useState } from 'react';
import { 
  Bot, Play, CheckCircle2, Sparkles, Layers, ArrowLeft, Terminal, 
  Send, Cpu, RefreshCw, Key, ShieldCheck, Zap, Code2, Bug, Palette, FileArchive, HardDrive, Eye, Lock
} from 'lucide-react';
import { sendDeepSeekChat } from '../services/deepseek';

interface Props {
  onSelectAgentForPrompt?: (capabilityName: string) => void;
  onBack?: () => void;
}

export const BrahmastraUltraAgent: React.FC<Props> = ({ onSelectAgentForPrompt, onBack }) => {
  // Brahmastra Single Unified Ultra Agent with integrated 10 capability matrices
  const [activeCapability, setActiveCapability] = useState<string>('all-inclusive');
  const [agentStatus, setAgentStatus] = useState<'ACTIVE' | 'PROCESSING' | 'READY'>('ACTIVE');
  const [totalOperations, setTotalOperations] = useState<number>(489);
  const [lastAction, setLastAction] = useState<string>('Brahmastra 3.5 Unified Core loaded with 10 built-in execution engines.');

  // DeepSeek interactive terminal state
  const [promptInput, setPromptInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string>(
    '⚡ బ్రహ్మాస్త్ర 3.5 ఆల్-ఇన్-వన్ అల్ట్రా ఏజెంట్ సిద్ధంగా ఉంది.\n' +
    '🔹 10 కోడింగ్ సామర్థ్యాలు (UI/UX, Code Gen, Security, Unpacker, Storage, Media, Bug Fixer, PWA/ZIP, Theme, Testing) ఈ ఒక్క ఏజెంట్‌లోనే ఏకీకృతం చేయబడ్డాయి.\n' +
    '🔹 డీప్‌సీక్ (DeepSeek) తాళం అనుసంధానించబడి పూర్తి ఆపరేషన్‌లో ఉంది.'
  );
  const [isRunningDeepSeek, setIsRunningDeepSeek] = useState(false);
  const [deepseekKey, setDeepseekKey] = useState(() => localStorage.getItem('deepseek_api_key') || import.meta.env.VITE_DEEPSEEK_API_KEY || '');

  const handleRunCapability = (capName: string) => {
    setActiveCapability(capName);
    setAgentStatus('PROCESSING');
    setTotalOperations(prev => prev + 1);
    setLastAction(`Triggered PWA Update at ${new Date().toLocaleTimeString()}`);

    setTerminalOutput((prev) => 
      `\n[${new Date().toLocaleTimeString()}] ⚡ PWA System Update Triggered...\n` + prev
    );

    setTimeout(() => {
      setAgentStatus('ACTIVE');
    }, 1200);
  };

  const handleExecuteDeepSeek = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptInput.trim()) return;

    const userPrompt = promptInput.trim();
    setPromptInput('');
    setIsRunningDeepSeek(true);
    setAgentStatus('PROCESSING');

    setTerminalOutput((prev) => 
      `\n>>> [అడ్మిన్ గారు]: ${userPrompt}\n[బ్రహ్మాస్త్ర 3.5 & డీప్‌సీక్ సూపర్-ఇంజిన్ విశ్లేషిస్తోంది...]` + prev
    );

    try {
      const response = await sendDeepSeekChat([
        {
          role: 'system',
          content: `You are Brahmastra 3.5 Single Unified Ultra Coding Agent integrated with DeepSeek and the All in One Library app. 
You possess all 10 unified coding matrices (UI/UX, Code Generator, Security, Unpacker, Storage, Media, Bug Fixer, PWA/ZIP, Theme, Testing).
Respond directly to Telugu Admin (అడ్మిన్ గారు) with pinpoint, character-level precision, zero-error complete code, and highest-grade technical clarity in Telugu/English.`
        },
        {
          role: 'user',
          content: userPrompt
        }
      ], { apiKey: deepseekKey });

      setTotalOperations(prev => prev + 1);
      setLastAction(`DeepSeek code generation completed at ${new Date().toLocaleTimeString()}`);
      setTerminalOutput((prev) => 
        `\n[బ్రహ్మాస్త్ర 3.5 అల్ట్రా స్పందన]:\n${response}\n` + prev
      );
    } catch (err: any) {
      setTerminalOutput((prev) => 
        `\n[ఎర్రర్]: ${err?.message || 'డీప్‌సీక్ ప్రాసెస్ చేయడంలో విఫలమైంది.'}\n` + prev
      );
    } finally {
      setIsRunningDeepSeek(false);
      setAgentStatus('ACTIVE');
    }
  };

  const saveDeepSeekKey = (newKey: string) => {
    setDeepseekKey(newKey);
    localStorage.setItem('deepseek_api_key', newKey);
  };

  return (
    <div 
      onDoubleClick={(e) => {
        e.stopPropagation();
        onBack?.();
      }}
      className="space-y-6 text-slate-900"
    >
      {/* Unified Master Agent Banner */}
      <div className="bg-gradient-to-r from-orange-100 via-orange-200 to-orange-100 border border-orange-400 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-2xl">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 bg-rose-600 hover:bg-rose-500 text-slate-900 rounded-xl transition-all shadow-md active:scale-95"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="p-3.5 bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded-2xl shadow-inner flex items-center justify-center">
            <Zap className="w-8 h-8 text-slate-900 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-wide flex items-center gap-2">
                <span>⚡ బ్రహ్మాస్త్ర 3.5 అల్ట్రా ఏజెంట్ (All-in-One Ultra Agent)</span>
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold">
                10-IN-1 UNIFIED CORE
              </span>
            </div>
            <p className="text-xs text-slate-900/80 mt-1">
              10 ఏజెంట్ల పూర్తి కోడింగ్ సామర్థ్యాలు ఏకీకృతం చేయబడిన ఏకైక అల్ట్రా ఇంజిన్ & డీప్‌సీక్ తాళం.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-1.5 text-xs font-mono font-semibold rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/40 flex items-center gap-1.5 shadow-sm">
            <Bot className="w-4 h-4" /> STATUS: {agentStatus}
          </div>
          <div className="px-3.5 py-1.5 text-xs font-mono font-semibold rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-4 h-4" /> DEEPSEEK CONNECTED
          </div>
        </div>
      </div>

      {/* Interactive DeepSeek & Unified Agent Console */}
      <div className="bg-orange-100 border border-orange-300 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-orange-300">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-orange-400" />
            <span className="text-sm font-bold font-mono text-slate-800">
              బ్రహ్మాస్త్ర 3.5 & డీప్‌సీక్ అల్ట్రా ఎగ్జిక్యూషన్ కన్సోల్
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 bg-orange-100 border border-orange-300 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-900">
              <Key className="w-3.5 h-3.5 text-slate-700" />
              <span>Key: {deepseekKey ? `${deepseekKey.substring(0, 8)}...` : 'Not Set'}</span>
            </div>
            <button
              onClick={() => {
                const k = prompt('డీప్‌సీక్ API Key నమోదు చేయండి:', deepseekKey);
                if (k) saveDeepSeekKey(k);
              }}
              className="text-xs bg-orange-100 hover:bg-orange-100 border border-orange-400 px-3 py-1.5 rounded-xl font-bold text-slate-800 transition active:scale-95"
            >
              మార్చు (Edit)
            </button>
          </div>
        </div>

        {/* Live Terminal Stream */}
        <div className="bg-orange-100 border border-orange-300 rounded-xl p-4 max-h-56 overflow-y-auto font-mono text-xs text-slate-900/90 whitespace-pre-wrap leading-relaxed shadow-inner">
          {terminalOutput}
        </div>

        {/* Interactive Query Form */}
        <form onSubmit={handleExecuteDeepSeek} className="grid grid-cols-2 gap-2 w-full">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="కోడింగ్ లేదా సిస్టమ్ సూచనను నమోదు చేయండి..."
            className="w-full bg-orange-100 border border-orange-300 rounded-xl px-3 py-3 text-xs text-slate-900 placeholder-amber-600/50 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={isRunningDeepSeek || !promptInput.trim()}
            className="w-full py-3 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-slate-900 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 active:scale-95 overflow-hidden"
          >
            {isRunningDeepSeek ? (
              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
            ) : (
              <Zap className="w-4 h-4 shrink-0" />
            )}
            <span className="truncate">{isRunningDeepSeek ? 'ఎగ్జిక్యూట్ అవుతోంది...' : 'రన్ చేయి (Execute)'}</span>
          </button>
        </form>
      </div>

      {/* Consolidated PWA System Update Board */}
      <div className="mt-8 relative">
        {/* Glowing effect underneath */}
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 rounded-2xl blur-md opacity-70 animate-pulse"></div>
        
        {/* Main PWA Board */}
        <div className="relative bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-full bg-yellow-400/20 flex items-center justify-center shrink-0 border border-yellow-500/30">
              <Sparkles className="w-7 h-7 text-yellow-600 animate-pulse" />
            </div>
            <div>
              <h4 className="text-lg font-black text-yellow-900 uppercase tracking-wide">
                PWA System Update (v4.0)
              </h4>
              <p className="text-xs text-yellow-800 font-semibold mt-1">
                మిగతా అన్ని ఏజెంట్ల సామర్థ్యాలు విజయవంతంగా బ్రహ్మాస్త్ర సిస్టంలో ఏకీకృతం చేయబడ్డాయి.
              </p>
              <p className="text-[10px] text-yellow-700/80 mt-1 max-w-md leading-relaxed">
                10-in-1 unified core integration complete. PWA local caching, manifest generator, and install prompts are now actively managed by Brahmastra Ultra.
              </p>
            </div>
          </div>
          
          <div className="relative z-10 shrink-0 group">
            {/* Intense Burning/Glowing Background Ring */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 rounded-xl blur-md opacity-80 animate-[pulse_1s_ease-in-out_infinite]"></div>
            
            {/* Syncing/Flashing Button */}
            <button 
              onClick={() => handleRunCapability('PWA System Initialization')}
              className="relative px-6 py-3 bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-400 text-yellow-950 font-black text-sm rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.8)] border border-yellow-200 transition active:scale-95 flex items-center gap-2 animate-[pulse_1.5s_ease-in-out_infinite]"
            >
              <Zap className="w-5 h-5 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
              <span className="tracking-wide">సిస్టం యాక్టివేట్ చేయి</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BrahmastraUltraAgent;
