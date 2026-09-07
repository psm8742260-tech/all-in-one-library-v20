import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, BookOpen, Mail, ArrowRight, ShieldCheck, Phone, Cpu, Wifi, AlertCircle, CheckCircle } from 'lucide-react';
import { LanguageCode, TRANSLATIONS } from '../types';
import { ALL_INDIA_LANGUAGES } from './LibraryModal';
import { AppLogoIcon } from './AppLogoIcon';

interface SplashProps {
  onLogin: (email: string, name: string) => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
}

export default function Splash({ onLogin, currentLanguage, onLanguageChange }: SplashProps) {
  const [isBookOpening, setIsBookOpening] = useState(false);
  const [emailInput, setEmailInput] = useState('psm8742260@gmail.com');
  const [loginMode, setLoginMode] = useState<'gmail' | 'sim' | 'custom'>('gmail');

  // SIM Login States
  const [phoneInput, setPhoneInput] = useState('8466062260');
  const [isSimPresent, setIsSimPresent] = useState(true);
  const [simScanningStage, setSimScanningStage] = useState(0); // 0: idle, 1: scanning tower, 2: verifying carrier, 3: success, -1: failed
  const [simScanningText, setSimScanningText] = useState('');

  const t = TRANSLATIONS[currentLanguage];

  const handleOAuthLogin = () => {
    if (isBookOpening) return;
    setIsBookOpening(true);
    // Simulate real OAuth popup delay and success
    setTimeout(() => {
      onLogin(emailInput, emailInput.split('@')[0]);
    }, 1500);
  };

  const handleSimLogin = () => {
    if (!phoneInput || phoneInput.length < 10) {
      alert('దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.');
      return;
    }
    setSimScanningStage(1);
    setSimScanningText('మొబైల్ నెట్‌వర్క్ సిగ్నల్ శోధిస్తోంది... (Scanning SIM Signal...)');

    // Step 1: Tower check
    setTimeout(() => {
      setSimScanningStage(2);
      setSimScanningText('క్యారియర్ సిమ్ ఐడెంటిటీని ధృవీకరిస్తోంది... (Verifying SIM Card...)');

      // Step 2: SIM verification check
      setTimeout(() => {
        if (isSimPresent) {
          setSimScanningStage(3);
          setSimScanningText('మొబైల్ సిమ్ విజయవంతంగా ధృవీకరించబడింది! తక్షణ లాగిన్ అవుతోంది...');
          
          setTimeout(() => {
            onLogin('sim_' + phoneInput + '@sim-auth.library', 'SIM ' + phoneInput);
          }, 1000);
        } else {
          setSimScanningStage(-1);
          setSimScanningText('ఈ ఫోన్‌లో సిమ్ కార్డ్ కనుగొనబడలేదు! (SIM Card Not Detected)');
        }
      }, 1500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col justify-between p-5 sm:p-6 text-slate-900 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-600/15 blur-[120px] pointer-events-none" />



      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 z-10 max-w-md mx-auto w-full">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full flex flex-col items-center text-center space-y-6"
        >
          {/* Exact Artwork Icon matching uploaded image IMG-20260828-WA0004.jpg with rotating 3D globe */}
          <div className="relative">
            <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl -z-10" />
            <AppLogoIcon className="w-64 h-64 sm:w-72 sm:h-72 my-4 drop-shadow-[0_10px_25px_rgba(234,88,12,0.35)]" />
          </div>

          {/* Main Title below card matching screenshot colors */}
          <div className="space-y-0.5 mt-3">
            <h1 className="text-[1.75rem] sm:text-3xl font-serif font-bold text-orange-400 tracking-wide drop-shadow-[0_2px_10px_rgba(249,115,22,0.3)]">
              All in One Library
            </h1>
            <p className="text-[13px] text-slate-700 font-sans tracking-wide opacity-90">
              Universal Knowledge Hub
            </p>
          </div>

          {/* Authentication Actions */}
          <div className="w-full space-y-4 pt-2">
            
            {loginMode === 'gmail' && (
              /* One-Tap Gmail Login Button (Exact white pill button matching screenshot) */
              <button
                onClick={handleOAuthLogin}
                disabled={isBookOpening}
                className="w-full bg-white hover:bg-amber-50 text-slate-900 font-bold py-4 px-6 rounded-full shadow-lg flex items-center justify-between transition-all duration-300 group border border-orange-100 active:scale-95 disabled:opacity-80"
                id="splash-gmail-login-btn"
              >
                <div className="flex items-center gap-4">
                  {isBookOpening ? (
                    <div className="w-6 h-6 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span className="text-[0.95rem] font-bold text-slate-800">
                    {isBookOpening ? "Connecting securely..." : (t.loginWithGmail || "Login with Gmail")}
                  </span>
                </div>
                {!isBookOpening && <ArrowRight className="w-5 h-5 text-orange-400 group-hover:translate-x-1 transition-transform" />}
              </button>
            )}

            {loginMode === 'sim' && (
              /* Minimalist SIM Card Instant Login Input in-place */
              simScanningStage > 0 ? (
                <div className="w-full bg-white rounded-full border border-orange-100 shadow-md py-4 px-6 flex items-center gap-3 justify-center text-xs font-bold text-slate-800 animate-pulse">
                  {simScanningStage === 3 ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : simScanningStage === -1 ? (
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  )}
                  <span className="text-[11px] font-bold truncate">
                    {simScanningText}
                  </span>
                  {simScanningStage === -1 && (
                    <button 
                      onClick={() => {
                        setSimScanningStage(0);
                        setPhoneInput('8466062260');
                      }}
                      className="ml-auto text-orange-500 hover:text-orange-600 underline text-[10px] shrink-0"
                    >
                      Retry
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative w-full bg-white rounded-full shadow-md border border-orange-100/50 flex items-center overflow-hidden">
                  <div className="pl-5 pr-2 py-4 flex items-center gap-1.5 text-slate-500 font-extrabold border-r border-orange-50/50 text-xs shrink-0">
                    <Phone className="w-3.5 h-3.5 text-orange-500" />
                    <span className="font-sans">+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="మొబైల్ సంఖ్య (Mobile Number)"
                    className="flex-1 bg-transparent px-3 py-4 text-xs font-bold text-slate-900 focus:outline-none placeholder-slate-400"
                    id="splash-phone-input"
                  />
                  <button
                    onClick={handleSimLogin}
                    disabled={isBookOpening || !phoneInput || phoneInput.length < 10}
                    className="p-2.5 mr-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-all active:scale-90 flex items-center justify-center shrink-0 disabled:opacity-40"
                    id="splash-sim-login-btn"
                    title="Verify SIM & Login"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )
            )}

            {loginMode === 'custom' && (
              /* Custom Email Form Card in-place */
              <div className="bg-white/95 border border-orange-200/60 p-5 rounded-[22px] shadow-lg text-left space-y-3.5">
                <label className="block text-xs font-bold text-slate-800 tracking-wide">ఈమెయిల్ చిరునామా (Email Address)</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-orange-500" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    id="email-login-field"
                  />
                </div>
                <button
                  onClick={handleOAuthLogin}
                  disabled={isBookOpening}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-black py-3 rounded-xl transition shadow-md shadow-orange-500/10 text-xs tracking-wider"
                  id="manual-login-submit"
                >
                  Proceed to App
                </button>
              </div>
            )}

            {/* Smart Switch Toggles & Footer Links */}
            <div className="flex flex-col items-center gap-2 pt-2 text-center">
              <div className="flex items-center gap-3.5 text-[11px] text-slate-500 font-bold">
                {loginMode === 'gmail' ? (
                  <>
                    <button 
                      onClick={() => setLoginMode('sim')}
                      className="hover:text-orange-500 transition-colors flex items-center gap-1"
                      id="switch-to-sim"
                    >
                      <Phone className="w-3.5 h-3.5 text-orange-500" />
                      మొబైల్ సిమ్ లాగిన్
                    </button>
                    <span className="text-slate-200">|</span>
                    <button 
                      onClick={() => setLoginMode('custom')}
                      className="hover:text-orange-500 transition-colors flex items-center gap-1"
                      id="switch-to-custom"
                    >
                      <Mail className="w-3.5 h-3.5 text-orange-500" />
                      కస్టమ్ ఈమెయిల్
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      setLoginMode('gmail');
                      setSimScanningStage(0);
                    }}
                    className="hover:text-orange-500 transition-colors flex items-center gap-1.5"
                    id="switch-to-gmail"
                  >
                    ← జిమెయిల్ లాగిన్‌కు తిరిగి వెళ్ళు (Back to Gmail)
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="tracking-wide">OAuth Secure & Encrypted</span>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}

