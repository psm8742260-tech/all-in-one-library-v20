import React, { useState, useRef } from 'react';
import { 
  X, Mic, Square, Play, Video, FileText, Upload, Sparkles, 
  Music, Film, BookOpen, CheckCircle2, AlertCircle, Radio, Globe
} from 'lucide-react';
import { WriterApplication, ContentType, LanguageCode } from '../types';
import { ALL_INDIA_LANGUAGES } from './LibraryModal';

interface WriterRegistrationModalProps {
  onClose: () => void;
  onRegister: (app: WriterApplication) => void;
  currentLanguage?: LanguageCode;
}

export default function WriterRegistrationModal({ onClose, onRegister, currentLanguage = 'te' }: WriterRegistrationModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [category, setCategory] = useState('Literature & Fiction');
  const [contentType, setContentType] = useState<ContentType>('audio');
  const [uploadLanguage, setUploadLanguage] = useState<string>(currentLanguage);
  
  // Text Content
  const [storyText, setStoryText] = useState('');
  
  // Audio & Voice Recording State
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Video State
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoFile, setVideoFile] = useState<string>('');

  // Sample presets for quick testing
  const handleLoadSampleAudio = () => {
    setAudioUrl('https://actions.google.com/sounds/v1/ambiences/daytime_forest_bonfire.ogg');
    setBookTitle('అడవిలో సాహసాలు (Forest Audio Story)');
    setBio('తెలుగు జానపద కథల గాయకుడు మరియు వాయిస్ ఆర్టిస్ట్');
    setStoryText('అనగనగా ఒక అందమైన అడవిలో ఒక చిన్న పక్షి ఉండేది...');
  };

  const handleLoadSampleVideo = () => {
    setVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    setBookTitle('పంచతంత్ర దృశ్య కావ్యం (Panchatantra Animation)');
    setBio('యానిమేషన్ కథా రచయిత');
    setStoryText('విష్ణు శర్మ రచించిన పంచతంత్ర కథల సజీవ దృశ్య రూపకం.');
  };

  // Start Live Microphone Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAudioUrl(reader.result as string);
        };
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert('మైక్రోఫోన్ యాక్సెస్ లభించలేదు. దయచేసి మైక్రోఫోన్ అనుమతి ఇవ్వండి లేదా ఆడియో ఫైల్ అప్‌లోడ్ చేయండి.');
    }
  };

  // Stop Live Voice Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Handle local file uploads (Audio or Video)
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAudioUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setVideoFile(reader.result as string);
        setVideoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setStoryText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !bookTitle.trim()) {
      alert('దయచేసి మీ పేరు, ఈమెయిల్ మరియు కథ/పుస్తకం పేరు నమోదు చేయండి.');
      return;
    }

    const application: WriterApplication = {
      id: `app-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      bio: bio.trim() || 'రచయిత / క్రియేటర్',
      bookTitle: bookTitle.trim(),
      contentType,
      category,
      audioUrl: contentType === 'audio' ? audioUrl : undefined,
      videoUrl: contentType === 'video' ? videoUrl : undefined,
      storyText: storyText.trim() || undefined,
      language: uploadLanguage,
      status: 'pending',
      timestamp: new Date().toLocaleString()
    };

    onRegister(application);
    alert(`ధన్యవాదాలు ${name}! మీ ${contentType === 'audio' ? 'వాయిస్ కథ' : contentType === 'video' ? 'వీడియో కథ' : 'పుస్తకం'} దరఖాస్తు విజయవంతంగా సమర్పించబడింది. ఇది నేరుగా అడ్మిన్ ప్యానెల్ రచయితల విభాగానికి చేరింది.`);
    onClose();
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 bg-orange-100/85 z-50 flex items-start justify-center pt-3 sm:pt-6 p-2 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="bg-orange-100 border border-orange-300 rounded-2xl w-full max-w-xl p-5 sm:p-6 shadow-2xl text-slate-900 my-auto sm:my-0 space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-orange-300">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-orange-600 to-amber-600 rounded-xl shadow-md">
              <Sparkles className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>రచయిత & క్రియేటర్ హబ్ (Writer & Creator Hub)</span>
              </h2>
              <p className="text-[11px] text-slate-800">
                పుస్తకాలు, వాయిస్ కథలు & వీడియో కథలను మన లైబ్రరీకి అప్‌లోడ్ చేయండి
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-700 hover:text-slate-950 hover:bg-orange-300 rounded-lg transition"
            id="close-writer-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Type Selector (Text / Voice Story / Video Story) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-800">
            మీరు అప్‌లోడ్ చేయాలనుకుంటున్న కంటెంట్ రకం (Select Content Type) *
          </label>
          <div className="grid grid-cols-3 gap-2">
            
            {/* Audio Voice Story Tab */}
            <button
              type="button"
              onClick={() => setContentType('audio')}
              className={`py-1.5 px-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                contentType === 'audio'
                  ? 'bg-amber-600/30 border-orange-500 shadow-md text-slate-950 ring-1 ring-orange-500'
                  : 'bg-orange-100 border-orange-300 text-slate-900 hover:border-orange-400'
              }`}
              id="writer-type-audio-btn"
            >
              <div className="flex items-center justify-between mb-0.5">
                <Mic className={`w-4 h-4 ${contentType === 'audio' ? 'text-amber-800' : 'text-slate-700'}`} />
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${contentType === 'audio' ? 'bg-amber-500/30 text-amber-950' : 'bg-slate-300/30 text-slate-700'}`}>ఆడియో</span>
              </div>
              <div className="text-[13px] font-extrabold text-slate-950 tracking-tight leading-tight">వాయిస్ కథ</div>
              <div className="text-[10px] font-extrabold text-slate-900 leading-tight">MP3 ఆడియో</div>
            </button>

            {/* Video Story Tab */}
            <button
              type="button"
              onClick={() => setContentType('video')}
              className={`py-1.5 px-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                contentType === 'video'
                  ? 'bg-rose-600/30 border-rose-500 shadow-md text-slate-950 ring-1 ring-rose-500'
                  : 'bg-orange-100 border-orange-300 text-slate-900 hover:border-orange-400'
              }`}
              id="writer-type-video-btn"
            >
              <div className="flex items-center justify-between mb-0.5">
                <Film className={`w-4 h-4 ${contentType === 'video' ? 'text-rose-800' : 'text-slate-700'}`} />
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${contentType === 'video' ? 'bg-rose-500/30 text-rose-950' : 'bg-slate-300/30 text-slate-700'}`}>వీడియో</span>
              </div>
              <div className="text-[13px] font-extrabold text-slate-950 tracking-tight leading-tight">వీడియో కథ</div>
              <div className="text-[10px] font-extrabold text-slate-900 leading-tight">MP4 / లింక్</div>
            </button>

            {/* Text Book Tab */}
            <button
              type="button"
              onClick={() => setContentType('text')}
              className={`py-1.5 px-2.5 rounded-xl border text-left flex flex-col justify-between transition ${
                contentType === 'text'
                  ? 'bg-orange-600/35 border-orange-600 shadow-md text-slate-950 ring-1 ring-orange-500'
                  : 'bg-orange-100 border-orange-300 text-slate-900 hover:border-orange-400'
              }`}
              id="writer-type-text-btn"
            >
              <div className="flex items-center justify-between mb-0.5">
                <BookOpen className={`w-4 h-4 ${contentType === 'text' ? 'text-orange-800' : 'text-slate-700'}`} />
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${contentType === 'text' ? 'bg-orange-500/30 text-orange-950' : 'bg-slate-300/30 text-slate-700'}`}>టెక్స్ట్</span>
              </div>
              <div className="text-[13px] font-extrabold text-slate-950 tracking-tight leading-tight">పుస్తకం / నవల</div>
              <div className="text-[10px] font-extrabold text-slate-900 leading-tight">టెక్స్ట్ ఈబుక్</div>
            </button>

          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">మీ పేరు (Your Name) *</label>
              <input 
                type="text" 
                placeholder="ఉదా: విష్ణు శర్మ / రమేష్" 
                className="w-full bg-orange-100 border border-orange-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-amber-400/40 focus:outline-none focus:ring-1 focus:ring-orange-500" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                id="writer-name-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">మీ ఈమెయిల్ (Email) *</label>
              <input 
                type="email" 
                placeholder="ఉదా: writer@example.com" 
                className="w-full bg-orange-100 border border-orange-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-amber-400/40 focus:outline-none focus:ring-1 focus:ring-orange-500" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                id="writer-email-input"
              />
            </div>
          </div>

          {/* Title, Category and Language */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                {contentType === 'audio' ? 'వాయిస్ కథ శీర్షిక (Audio Title) *' : contentType === 'video' ? 'వీడియో శీర్షిక (Video Title) *' : 'పుస్తకం పేరు (Book Title) *'}
              </label>
              <input 
                type="text" 
                placeholder="ఉదా: పంచతంత్రం / అమరావతి కథలు" 
                className="w-full bg-orange-100 border border-orange-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-amber-400/40 focus:outline-none focus:ring-1 focus:ring-orange-500" 
                value={bookTitle} 
                onChange={e => setBookTitle(e.target.value)} 
                required 
                id="writer-title-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">కేటగిరీ (Category)</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-orange-100 border border-orange-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                id="writer-category-select"
              >
                <option value="Literature & Fiction">సాహిత్యం & నవలలు (Literature)</option>
                <option value="Kids & Moral Stories">పిల్లల నీతి కథలు (Kids & Morals)</option>
                <option value="Mantras & Spirituality">భక్తి & పురాణాలు (Spirituality)</option>
                <option value="Mystery & Thriller">మిస్టరీ & సస్పెన్స్ (Mystery)</option>
                <option value="Science & History">చరిత్ర & సైన్స్ (Science & History)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-orange-600" />
                <span>రచన భాష (Language) *</span>
              </label>
              <select
                value={uploadLanguage}
                onChange={e => setUploadLanguage(e.target.value)}
                className="w-full bg-orange-100 border border-orange-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500 font-bold"
                id="writer-language-select"
              >
                {ALL_INDIA_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.native} ({lang.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bio / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">మీ పరిచయం / కథా సారాంశం (Bio & Story Summary)</label>
            <textarea 
              rows={2}
              placeholder="మీ గురించి మరియు ఈ కథ యొక్క ముఖ్య ఉద్దేశం క్లుప్తంగా వ్రాయండి..." 
              className="w-full bg-orange-100 border border-orange-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-amber-400/40 focus:outline-none focus:ring-1 focus:ring-orange-500" 
              value={bio} 
              onChange={e => setBio(e.target.value)} 
              id="writer-bio-input"
            />
          </div>

          {/* Dynamic Media Section based on Content Type */}

          {/* 1. AUDIO / VOICE STORY SECTION */}
          {contentType === 'audio' && (
            <div className="bg-orange-100 border border-orange-400 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Mic className="w-4 h-4" />
                  <span>వాయిస్ రికార్డింగ్ లేదా ఆడియో ఫైల్ (Voice Story Studio)</span>
                </span>
                <button
                  type="button"
                  onClick={handleLoadSampleAudio}
                  className="text-[10px] text-slate-700 hover:text-slate-950 underline font-semibold"
                >
                  శాంపిల్ ఆడియో నింపు (Fill Sample)
                </button>
              </div>

              {/* Live Voice Recording Controls */}
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-orange-100 border border-orange-300 p-3 rounded-xl">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-900 text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                    id="writer-start-record-btn"
                  >
                    <Mic className="w-4 h-4 text-slate-900 animate-bounce" />
                    <span>వాయిస్ రికార్డ్ చేయండి (Live Record)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="w-full sm:w-auto bg-rose-600 hover:bg-rose-500 text-slate-900 text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95 animate-pulse"
                    id="writer-stop-record-btn"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>రికార్డింగ్ ఆపు ({formatSecs(recordingSeconds)})</span>
                  </button>
                )}

                <div className="text-center sm:text-left text-[11px] text-slate-800 flex-1">
                  {isRecording ? (
                    <span className="text-rose-400 font-semibold flex items-center gap-1 justify-center sm:justify-start">
                      <Radio className="w-3.5 h-3.5 animate-ping" /> మైక్రోఫోన్ రికార్డ్ అవుతోంది...
                    </span>
                  ) : (
                    <span>మీ స్వంత గొంతుతో కథ చెప్పి లైబ్రరీలో పంచుకోండి</span>
                  )}
                </div>
              </div>

              {/* Upload local audio file */}
              <div className="space-y-1">
                <label className="block text-[11px] text-slate-800">లేదా ఆడియో ఫైల్ (MP3/WAV) అప్‌లోడ్ చేయండి:</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileUpload}
                  className="w-full text-xs text-slate-800 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-600/30 file:text-slate-800 hover:file:bg-orange-600/40 cursor-pointer bg-orange-100 border border-orange-300 rounded-xl p-1"
                />
              </div>

              {/* Audio URL input or preview */}
              <div>
                <input
                  type="text"
                  value={audioUrl}
                  onChange={e => setAudioUrl(e.target.value)}
                  placeholder="లేదా ఆడియో లింక్ / URL నమోదు చేయండి (https://...)"
                  className="w-full bg-orange-100 border border-orange-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 placeholder-amber-400/40 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono text-[11px]"
                />
              </div>

              {/* Audio Playback Preview */}
              {audioUrl && (
                <div className="bg-orange-100 border border-orange-400 rounded-xl p-2.5 flex items-center gap-3">
                  <Music className="w-4 h-4 text-slate-700 shrink-0" />
                  <audio src={audioUrl} controls className="w-full h-8" />
                </div>
              )}
            </div>
          )}

          {/* 2. VIDEO STORY SECTION */}
          {contentType === 'video' && (
            <div className="bg-orange-100 border border-rose-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <Film className="w-4 h-4" />
                  <span>వీడియో కథా వివరాలు (Video Story Studio)</span>
                </span>
                <button
                  type="button"
                  onClick={handleLoadSampleVideo}
                  className="text-[10px] text-rose-300 hover:text-slate-950 underline font-semibold"
                >
                  శాంపిల్ వీడియో నింపు (Fill Sample)
                </button>
              </div>

              <div>
                <label className="block text-[11px] text-slate-800 mb-1">వీడియో స్ట్రీమ్ లింక్ / MP4 URL:</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  placeholder="ఉదా: https://example.com/story.mp4"
                  className="w-full bg-orange-100 border border-orange-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-amber-400/40 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                  id="writer-video-url-input"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-800 mb-1">లేదా వీడియో ఫైల్ అప్‌లోడ్ చేయండి:</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileUpload}
                  className="w-full text-xs text-slate-800 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-rose-600/30 file:text-rose-200 hover:file:bg-rose-600/40 cursor-pointer bg-orange-100 border border-orange-300 rounded-xl p-1"
                />
              </div>

              {/* Video Preview */}
              {videoUrl && (
                <div className="bg-orange-100 border border-rose-500/40 rounded-xl p-2 overflow-hidden">
                  <video src={videoUrl} controls className="w-full h-40 rounded-lg object-contain bg-orange-100" />
                </div>
              )}
            </div>
          )}

          {/* 3. STORY TEXT SCRIPT SECTION */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-800">
              కథ విషయము / సారాంశం (Story Text & Content)
            </label>

            {/* Direct Book text file upload */}
            {contentType === 'text' && (
              <div className="bg-orange-50 border border-orange-300 rounded-xl p-3 space-y-1.5 shadow-sm">
                <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                  <span>లేదా పుస్తకం ఫైల్ (.txt ఫైల్) నేరుగా అప్‌లోడ్ చేయండి</span>
                </span>
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleTextFileUpload}
                  className="w-full text-xs text-slate-800 file:mr-2.5 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-orange-600/20 file:text-slate-800 hover:file:bg-orange-600/30 cursor-pointer bg-orange-100 border border-orange-200 rounded-xl p-1"
                />
                <p className="text-[9px] text-slate-700 font-medium">చిట్కా: .txt ఫైల్ అప్‌లోడ్ చేయగానే టెక్స్ట్ ఆటోమేటిక్‌గా కింద ఫిల్ అవుతుంది.</p>
              </div>
            )}

            <textarea 
              rows={3}
              placeholder="కథ పూర్తి టెక్స్ట్ లేదా డైలాగులు ఇక్కడ వ్రాయండి..." 
              className="w-full bg-orange-100 border border-orange-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-amber-400/40 focus:outline-none focus:ring-1 focus:ring-orange-500" 
              value={storyText} 
              onChange={e => setStoryText(e.target.value)} 
              id="writer-story-text-input"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-900 font-bold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-xs"
            id="submit-writer-app-btn"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>రిజిస్ట్రేషన్ & కంటెంట్ అప్‌లోడ్ చేయి (Submit to Admin Panel)</span>
          </button>
        </form>
      </div>
    </div>
  );
}
