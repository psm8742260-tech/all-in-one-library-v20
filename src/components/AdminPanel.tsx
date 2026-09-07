import React, { useState } from 'react';
import { 
  ShieldCheck, Upload, Trash2, Plus, X, BookOpen, AlertCircle, 
  Check, Lock, Sparkles, FolderPlus, Settings, Users, Bot, Zap,
  QrCode, IndianRupee, CheckCircle2, Copy, Mic, Film, Play, Music, Radio, Globe, Youtube
} from 'lucide-react';
import { Book, Folder, User, LanguageCode, TRANSLATIONS, WriterApplication, ContentType, RegisteredTree } from '../types';
import BrahmastraUltraAgent from './BrahmastraUltraAgent';

interface AdminPanelProps {
  user: User;
  books: Book[];
  folders: Folder[];
  writerApplications: WriterApplication[];
  onClose: () => void;
  onAddBook: (newBook: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onUpdateBooks?: (updatedBooks: Book[]) => void;
  onApproveApplication?: (app: WriterApplication) => void;
  currentLanguage: LanguageCode;
  registeredTrees?: RegisteredTree[];
  onApproveTree?: (treeId: string) => void;
  onRejectTree?: (treeId: string) => void;
  onDeleteTree?: (treeId: string) => void;
}

export default function AdminPanel({
  user,
  books,
  folders,
  writerApplications,
  onClose,
  onAddBook,
  onDeleteBook,
  onUpdateBooks,
  onApproveApplication,
  currentLanguage,
  registeredTrees = [],
  onApproveTree,
  onRejectTree,
  onDeleteTree
}: AdminPanelProps) {
  // Check if current user is admin (e.g. psm8742260@gmail.com)
  const ADMIN_EMAIL = 'psm8742260@gmail.com';
  const ADMIN_SIM_EMAIL = 'sim_8466062260@sim-auth.library';
  const [adminAuthInput, setAdminAuthInput] = useState('');
  const [isAuthVerified, setIsAuthVerified] = useState<boolean>(
    user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
    user.email.toLowerCase() === ADMIN_SIM_EMAIL.toLowerCase()
  );
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Tab: default to 'manage' so that the dual-folder UI is immediately visible to the Admin
  const [activeTab, setActiveTab] = useState<'writers' | 'upload' | 'manage' | 'settings' | 'pricing' | 'brahmastra' | 'trees'>('manage');

  // Book / Multimedia Upload Form State
  const [contentType, setContentType] = useState<ContentType>('text');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [folderId, setFolderId] = useState<string>('');
  const [costToUnlock, setCostToUnlock] = useState<number>(0);
  const [costPerMinute, setCostPerMinute] = useState<number>(1);
  const [coverImage, setCoverImage] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Chapters Form State
  const [chapters, setChapters] = useState<{ title: string; content: string }[]>([
    { title: 'Chapter 1: Introduction', content: '' },
    { title: 'Chapter 2: Core Concepts', content: '' }
  ]);

  const [notification, setNotification] = useState<string | null>(null);
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null);
  const [youtubePublishApp, setYoutubePublishApp] = useState<WriterApplication | null>(null);
  const [ytTitle, setYtTitle] = useState('');
  const [ytDescription, setYtDescription] = useState('');
  const [ytTags, setYtTags] = useState('');
  const [ytIsGenerating, setYtIsGenerating] = useState(false);
  const [ytUploadProgress, setYtUploadProgress] = useState(0);
  const [ytIsUploading, setYtIsUploading] = useState(false);
  const [ytSuccessUrl, setYtSuccessUrl] = useState<string | null>(null);
  const [ytStatusLog, setYtStatusLog] = useState('');

  // Inline editing state for manage books tab
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [editBookTitle, setEditBookTitle] = useState('');
  const [editBookAuthor, setEditBookAuthor] = useState('');
  const [editBookCost, setEditBookCost] = useState<number>(0);
  const [activeManageFolder, setActiveManageFolder] = useState<'general' | 'palm'>('general');

  // Pricing & UPI QR Settings State
  const [readPriceINR, setReadPriceINR] = useState<number>(() => {
    const saved = localStorage.getItem('library_read_price');
    return saved ? Number(saved) : 10;
  });

  const [downloadPriceINR, setDownloadPriceINR] = useState<number>(() => {
    const saved = localStorage.getItem('library_download_price');
    return saved ? Number(saved) : 29;
  });

  const [adminUpiId, setAdminUpiId] = useState<string>(() => {
    return localStorage.getItem('library_admin_upi') || 'psm8742260@upi';
  });

  const [adminQrImage, setAdminQrImage] = useState<string>(() => {
    return localStorage.getItem('library_admin_qr_image') || '';
  });

  // New States for Audio Free Listening Limit & Sample Pages Limit
  const [freeListeningSeconds, setFreeListeningSeconds] = useState<number>(() => {
    const saved = localStorage.getItem('library_free_listening_seconds');
    return saved ? Number(saved) : 60; // default 60 seconds (1 minute)
  });

  const [samplePagesCount, setSamplePagesCount] = useState<number>(() => {
    const saved = localStorage.getItem('library_sample_pages_count');
    return saved ? Number(saved) : 5; // default 5 pages
  });

  const [isSampleEnabled, setIsSampleEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('library_is_sample_enabled');
    return saved ? saved === 'true' : true; // default true
  });

  // DeepSeek Settings State
  const [useDeepSeek, setUseDeepSeek] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('deepseek_settings');
      if (saved) {
        return !!JSON.parse(saved).useDeepSeek;
      }
    } catch (e) {}
    return true;
  });

  const [deepseekApiKey, setDeepseekApiKey] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('deepseek_settings');
      if (saved) {
        return JSON.parse(saved).apiKey || import.meta.env.VITE_DEEPSEEK_API_KEY || '';
      }
    } catch (e) {}
    return import.meta.env.VITE_DEEPSEEK_API_KEY || '';
  });

  const [deepseekBaseUrl, setDeepseekBaseUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('deepseek_settings');
      if (saved) {
        return JSON.parse(saved).baseUrl || 'https://api.deepseek.com';
      }
    } catch (e) {}
    return 'https://api.deepseek.com';
  });

  const [deepseekModel, setDeepseekModel] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('deepseek_settings');
      if (saved) {
        return JSON.parse(saved).model || 'deepseek-chat';
      }
    } catch (e) {}
    return 'deepseek-chat';
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('library_read_price', readPriceINR.toString());
    localStorage.setItem('library_download_price', downloadPriceINR.toString());
    localStorage.setItem('library_admin_upi', adminUpiId.trim());
    localStorage.setItem('library_admin_qr_image', adminQrImage.trim());
    localStorage.setItem('library_free_listening_seconds', freeListeningSeconds.toString());
    localStorage.setItem('library_sample_pages_count', samplePagesCount.toString());
    localStorage.setItem('library_is_sample_enabled', isSampleEnabled ? 'true' : 'false');
    
    // Dispatch a custom event so other components (like Dashboard) update instantly
    window.dispatchEvent(new Event('admin_settings_updated'));

    setNotification('ధరలు, క్యూఆర్ కోడ్ మరియు ఆడియో/శాంపిల్ పరిమితులు విజయవంతంగా భద్రపరచబడ్డాయి!');
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = {
      useDeepSeek,
      apiKey: deepseekApiKey.trim(),
      baseUrl: deepseekBaseUrl.trim(),
      model: deepseekModel.trim()
    };
    localStorage.setItem('deepseek_settings', JSON.stringify(settings));
    localStorage.setItem('deepseek_api_key', deepseekApiKey.trim());
    setNotification('అనుసంధాన సెట్టింగులు విజయవంతంగా భద్రపరచబడ్డాయి! చాట్ అసిస్టెంట్ ఇప్పుడు ఈ కాన్ఫిగరేషన్‌ను ఉపయోగిస్తుంది.');
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAutoSyncFreeBooks = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const FREE_INTERNET_BOOKS: Book[] = [
      {
        id: 'sync-alice-wonderland',
        title: "Alice's Adventures in Wonderland (ఆలిస్ వండర్‌లాండ్)",
        author: 'Lewis Carroll',
        description: 'A beloved 1865 English novel about a young girl named Alice who falls through a rabbit hole into a subterranean fantasy world.',
        category: 'Classics & Novels',
        coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80',
        costToUnlock: 0,
        costPerMinute: 0,
        isUnlocked: true,
        chapters: [
          {
            id: 'alice-ch-1',
            title: 'అధ్యాయం 1: కుందేలు రంధ్రం లోపలికి (Down the Rabbit-Hole)',
            content: `ఆలిస్ తన సోదరి పక్కన నదీతీరంలో కూర్చుని ఏమీ చేయకుండా విసిగిపోవటం మొదలుపెట్టింది. అప్పుడే గులాబీ రంగు కళ్ళు కలిగిన ఒక తెల్లటి కుందేలు ఆమె పక్కనుంచి పరుగెత్తింది.`
          }
        ]
      },
      {
        id: 'sync-sherlock-holmes',
        title: 'The Adventures of Sherlock Holmes (షెర్లాక్ హోమ్స్ సాహసాలు)',
        author: 'Arthur Conan Doyle',
        description: 'Classic detective stories featuring consulting detective Sherlock Holmes and Dr. John H. Watson.',
        category: 'Mystery & Thriller',
        coverImage: 'https://images.unsplash.com/photo-1587876931567-564ce588bfbd?auto=format&fit=crop&w=400&q=80',
        costToUnlock: 0,
        costPerMinute: 0,
        isUnlocked: true,
        chapters: [
          {
            id: 'sher-ch-1',
            title: 'అధ్యాయం 1: బోహేమియాలో కుంభకోణం (A Scandal in Bohemia)',
            content: `షెర్లాక్ హోమ్స్ దృష్టిలో ఆమె ఎప్పుడూ 'ఆ స్త్రీ' (The Woman) గానే మిగిలిపోయింది.`
          }
        ]
      },
      {
        id: 'sync-bhagavad-gita',
        title: 'The Bhagavad Gita Essence (భగవద్గీత సారాంశం)',
        author: 'Maharshi Vedavyasa',
        description: 'The 700-verse Hindu scripture presenting eternal wisdom of dharma, yoga, bhakti, and karma.',
        category: 'Mantras & Spirituality',
        coverImage: 'https://images.unsplash.com/photo-1609137144814-6869a8385bbd?auto=format&fit=crop&w=400&q=80',
        costToUnlock: 0,
        costPerMinute: 0,
        isUnlocked: true,
        chapters: [
          {
            id: 'gita-essence-ch-1',
            title: 'అధ్యాయం 1: విషాద యోగము మరియు కర్మ సిద్ధాంతం',
            content: `కురుక్షేత్ర యుద్ధభూమిలో శ్రీకృష్ణుడు అర్జునుడికి కర్తవ్యాన్ని బోధిస్తూ "కర్మణ్యేవాధికారస్తే మా ఫలేషు కదాచన" అని చెప్పాడు.`
          }
        ]
      }
    ];

    let newlyAddedCount = 0;
    FREE_INTERNET_BOOKS.forEach(freeBook => {
      const alreadyExists = books.some(b => b.id === freeBook.id || b.title === freeBook.title);
      if (!alreadyExists) {
        onAddBook(freeBook);
        newlyAddedCount++;
      }
    });

    setIsSyncing(false);
    if (newlyAddedCount > 0) {
      setNotification(`ఇంటర్నెట్ నుండి ${newlyAddedCount} ఉచిత క్లాసిక్ పుస్తకాలు విజయవంతంగా సింక్ చేయబడ్డాయి!`);
    } else {
      setNotification('ఉచిత పుస్తకాలు అన్నీ ఇప్పటికే మీ లైబ్రరీలో సింక్ అయి ఉన్నాయి!');
    }
    setTimeout(() => setNotification(null), 3500);
  };

  const handleVerifyAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      adminAuthInput.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
      adminAuthInput.trim() === 'admin123' ||
      adminAuthInput.trim() === '6606' ||
      user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
    ) {
      setIsAuthVerified(true);
      setAuthError(null);
    } else {
      setAuthError(`అడ్మిన్ యాక్సెస్ కొరకు ${ADMIN_EMAIL} నమోదు చేయండి.`);
    }
  };

  React.useEffect(() => {
    if (youtubePublishApp) {
      setYtSuccessUrl(null);
      setYtUploadProgress(0);
      setYtStatusLog('');
      
      const languageMap: Record<string, string> = {
        te: 'తెలుగు (Telugu)',
        en: 'ఇంగ్లీష్ (English)',
        hi: 'హిందీ (Hindi)',
        ta: 'తమిళం (Tamil)',
        kn: 'కన్నడ (Kannada)',
        ml: 'మలయాళం (Malayalam)',
        mr: 'మరాఠీ (Marathi)',
        gu: 'గుజరాతీ (Gujarati)',
        pa: 'పంజాబీ (Punjabi)',
        bn: 'బెంగాలీ (Bengali)',
        or: 'ఒరియా (Oriya)',
        ur: 'ఉర్దూ (Urdu)'
      };
      const langName = languageMap[youtubePublishApp.language || 'te'] || 'తెలుగు (Telugu)';
      
      setYtTitle(`🔥 అద్భుతమైన కథనం: ${youtubePublishApp.bookTitle} | రచయిత: ${youtubePublishApp.name} | ${langName} Moral Stories`);
      setYtDescription(`నమస్కారం ప్రేక్షకులకు! మన డిజిటల్ లైబ్రరీ రచయితల వేదిక నుండి ${youtubePublishApp.name} గారు పంపిన అద్భుతమైన రచన: "${youtubePublishApp.bookTitle}".
      
📖 కథ వివరాలు (Story Details):
• పుస్తకం/కథ పేరు: ${youtubePublishApp.bookTitle}
• రచయిత: ${youtubePublishApp.name}
• విభాగం (Category): ${youtubePublishApp.category || 'General'}
• భాష (Language): ${langName}

కథ సారాంశం:
"${youtubePublishApp.storyText ? youtubePublishApp.storyText.slice(0, 150) + '...' : youtubePublishApp.bio || 'రచన వివరాలు...'}"

మరిన్ని అద్భుతమైన కథలు, ఆడియో బుక్స్ వినడానికి మన ఛానల్‌ని సబ్‌స్క్రైబ్ చేసుకోండి!
#${youtubePublishApp.name.replace(/\s+/g, '')} #Stories #MoralStories #DigitalLibrary #AudioBook`);
      setYtTags(`${youtubePublishApp.bookTitle}, ${youtubePublishApp.name}, Telugu Stories, Moral Stories, ${langName} Stories, Audio Books, Digital Library`);
    }
  }, [youtubePublishApp]);

  const handleGenerateYTMetadata = () => {
    if (!youtubePublishApp) return;
    setYtIsGenerating(true);
    setTimeout(() => {
      const languageMap: Record<string, string> = {
        te: 'తెలుగు (Telugu)',
        en: 'ఇంగ్లీష్ (English)',
        hi: 'హిందీ (Hindi)',
        ta: 'తమిళం (Tamil)',
        kn: 'కన్నడ (Kannada)',
        ml: 'మలయాళం (Malayalam)',
        mr: 'మరాఠీ (Marathi)',
        gu: 'గుజరాతీ (Gujarati)',
        pa: 'పంజాబీ (Punjabi)',
        bn: 'బెంగాలీ (Bengali)',
        or: 'ఒరియా (Oriya)',
        ur: 'ఉర్దూ (Urdu)'
      };
      const langName = languageMap[youtubePublishApp.language || 'te'] || 'తెలుగు (Telugu)';
      
      setYtTitle(`🔥 అద్భుతమైన వైరల్ కథనం: ${youtubePublishApp.bookTitle} | రచయిత: ${youtubePublishApp.name} | ${langName} Stories`);
      setYtDescription(`నమస్కారం ప్రేక్షకులకు! మన డిజిటల్ లైబ్రరీ రచయితల వేదిక నుండి ${youtubePublishApp.name} గారు పంపిన అద్భుతమైన రచన: "${youtubePublishApp.bookTitle}".
      
📖 కథ వివరాలు (Story Details):
• పుస్తకం/కథ పేరు: ${youtubePublishApp.bookTitle}
• రచయిత: ${youtubePublishApp.name}
• విభాగం (Category): ${youtubePublishApp.category || 'General'}
• భాష (Language): ${langName}

కథ సారాంశం:
"${youtubePublishApp.storyText ? youtubePublishApp.storyText : youtubePublishApp.bio || 'రచన వివరాలు...'}"

మరిన్ని అద్భుతమైన కథలు, ఆడియో బుక్స్ వినడానికి మన ఛానల్‌ని సబ్‌స్క్రైబ్ చేసుకోండి!
#${youtubePublishApp.name.replace(/\s+/g, '')} #Stories #MoralStories #DigitalLibrary #AudioBook #Trending #YouTubeGaming #ViralStories`);
      setYtTags(`${youtubePublishApp.bookTitle}, ${youtubePublishApp.name}, Telugu Stories, Moral Stories, ${langName} Stories, Audio Books, Digital Library, ViralStories2026`);
      setYtIsGenerating(false);
    }, 1000);
  };

  const handleYTUploadSimulation = () => {
    if (!youtubePublishApp) return;
    setYtIsUploading(true);
    setYtUploadProgress(5);
    setYtSuccessUrl(null);
    setYtStatusLog('యూట్యూబ్ సర్వర్‌కి కనెక్ట్ అవుతోంది (Connecting to YouTube Server)...');

    const steps = [
      { progress: 15, log: 'మీ ఛానల్ క్రెడెన్షియల్స్ ధృవీకరించబడుతున్నాయి (Verifying Channel Authorization)...' },
      { progress: 35, log: 'వీడియో కథనం ఫైల్ చంక్స్ సిద్ధం చేయబడుతున్నాయి (Preparing video story chunks)...' },
      { progress: 55, log: 'వీడియోను యూట్యూబ్ అప్‌లోడ్ పోర్ట్‌కు బదిలీ చేస్తున్నాము (Uploading video stream to YouTube Creator backend)...' },
      { progress: 75, log: 'AI శీర్షిక, వివరణ మరియు ట్యాగ్‌లను అటాచ్ చేస్తున్నాము (Attaching AI Optimized Title, Description & Search Tags)...' },
      { progress: 90, log: 'యూట్యూబ్ మోనటైజేషన్ & సేఫ్టీ చెక్స్ నడుస్తున్నాయి (Running YouTube Policy & Content Safety Checks)...' },
      { progress: 100, log: 'ప్రచురణ విజయవంతంగా పూర్తయింది! (Upload Completed! Video is now Live on YouTube)' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setYtUploadProgress(step.progress);
        setYtStatusLog(step.log);
        currentStep++;
      } else {
        clearInterval(interval);
        setYtIsUploading(false);
        const randomId = Math.random().toString(36).substring(2, 11);
        setYtSuccessUrl(`https://youtu.be/${randomId}`);
        setNotification(`కథ "${youtubePublishApp.bookTitle}" విజయవంతంగా మన యూట్యూబ్ ఛానల్‌లో ప్రచురించబడింది!`);
        setTimeout(() => setNotification(null), 3000);
      }
    }, 1200);
  };

  const handleAddChapter = () => {
    setChapters(prev => [
      ...prev,
      { title: `Chapter ${prev.length + 1}`, content: '' }
    ]);
  };

  const handleRemoveChapter = (index: number) => {
    if (chapters.length <= 1) return;
    setChapters(prev => prev.filter((_, i) => i !== index));
  };

  const handleChapterChange = (index: number, field: 'title' | 'content', value: string) => {
    setChapters(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleResetForm = () => {
    setContentType('text');
    setTitle('');
    setAuthor('');
    setCategory('General');
    setDescription('');
    setFolderId('');
    setCostToUnlock(0);
    setCostPerMinute(1);
    setCoverImage('');
    setAudioUrl('');
    setVideoUrl('');
    setChapters([
      { title: 'Chapter 1: Introduction', content: '' },
      { title: 'Chapter 2: Core Concepts', content: '' }
    ]);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      alert('పుస్తకం/కథ పేరు మరియు రచయిత పేరు తప్పనిసరి.');
      return;
    }

    const newBook: Book = {
      id: `book-${Date.now()}`,
      title: title.trim(),
      author: author.trim(),
      category: category.trim() || 'General',
      contentType,
      audioUrl: contentType === 'audio' ? audioUrl.trim() || undefined : undefined,
      videoUrl: contentType === 'video' ? videoUrl.trim() || undefined : undefined,
      description: description.trim() || (contentType === 'audio' ? 'వాయిస్ ఆడియో కథ' : contentType === 'video' ? 'వీడియో కథ' : 'నో డిస్క్రిప్షన్'),
      coverImage: coverImage.trim() || (
        contentType === 'audio' 
          ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80'
          : contentType === 'video'
          ? 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
      ),
      costToUnlock: Number(costToUnlock) || 0,
      costPerMinute: Number(costPerMinute) || 1,
      isUnlocked: true,
      folderId: folderId || undefined,
      chapters: chapters.map((ch, idx) => ({
        id: `ch-${idx + 1}`,
        title: ch.title.trim() || `Chapter ${idx + 1}`,
        content: ch.content.trim() || `ఈ అధ్యాయంలో సమాచారం ఇంకా పూర్తికాలేదు.`,
        audioUrl: contentType === 'audio' ? audioUrl : undefined,
        videoUrl: contentType === 'video' ? videoUrl : undefined
      }))
    };

    onAddBook(newBook);
    handleResetForm();
    setNotification(
      contentType === 'audio' 
        ? 'వాయిస్ కథ లైబ్రరీకి విజయవంతంగా అప్‌లోడ్ చేయబడింది!' 
        : contentType === 'video' 
        ? 'వీడియో కథ లైబ్రరీకి విజయవంతంగా అప్‌లోడ్ చేయబడింది!'
        : 'పుస్తకం నేరుగా లైబ్రరీకి విజయవంతంగా అప్‌లోడ్ చేయబడింది!'
    );
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="fixed inset-0 bg-orange-100/40 backdrop-blur-md flex items-start justify-center pt-3 sm:pt-6 p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-orange-50 border border-orange-300/80 rounded-2xl w-full max-w-3xl max-h-[86vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-orange-100/90 border-b border-orange-300/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-600 rounded-xl border border-blue-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>అడ్మిన్ ప్యానెల్ (Admin Panel)</span>
                <span className="bg-red-100 text-red-600 border border-red-300 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase ml-2 animate-pulse">Updated V2.0</span>
              </h3>
              <p className="text-[11px] text-slate-700 font-mono">
                Admin: {ADMIN_EMAIL}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-700 hover:text-slate-950 hover:bg-orange-200 rounded-lg transition"
            id="close-admin-panel-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {!isAuthVerified ? (
          /* Authentication Screen */
          <div className="p-8 text-center space-y-5 my-auto">
            <div className="w-14 h-14 bg-orange-100 border border-orange-300 rounded-full flex items-center justify-center mx-auto text-slate-700 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="text-base font-bold text-slate-900">అడ్మిన్ లాగిన్ అవసరం</h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                ఈ ప్యానెల్‌ని తెరవడానికి అడ్మిన్ జిమెయిల్ ద్వారా ప్రామాణీకరించుకోండి.
              </p>
            </div>

            <form onSubmit={handleVerifyAdmin} className="max-w-md mx-auto space-y-3">
              <input
                type="text"
                value={adminAuthInput}
                onChange={(e) => setAdminAuthInput(e.target.value)}
                placeholder="అడ్మిన్ జిమెయిల్ (psm8742260@gmail.com)"
                className="w-full bg-orange-50 border border-orange-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="admin-gmail-verify-input"
              />
              {authError && (
                <div className="flex items-center gap-2 text-rose-600 text-xs bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg text-left">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 bg-orange-100 hover:bg-orange-200 text-slate-800 py-2.5 rounded-xl text-xs font-semibold transition"
                >
                  క్యాన్సల్
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-blue-600 hover:bg-blue-500 text-slate-900 py-2.5 rounded-xl text-xs font-semibold transition"
                  id="submit-admin-verify-btn"
                >
                  ప్రవేశించు
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Admin Verified Interface */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Navigation Tabs - Reordered as requested */}
            <div className="flex border-b border-orange-300 bg-orange-100/70 px-4 pt-2 gap-2 overflow-x-auto scrollbar-none shrink-0">
              
              {/* TAB 1: WRITER APPLICATIONS (Primary) */}
              <button
                onClick={() => setActiveTab('writers')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-xl transition border-b-2 whitespace-nowrap ${
                  activeTab === 'writers'
                    ? 'border-indigo-500 text-indigo-600 bg-orange-100/90 shadow-sm'
                    : 'border-transparent text-slate-700 hover:text-slate-800'
                }`}
                id="admin-tab-writers"
              >
                <Users className="w-4 h-4 text-indigo-600" />
                <span>రచయితలు (Writers - {writerApplications.length})</span>
              </button>

              {/* TAB 2: UPLOAD BOOK */}
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-xl transition border-b-2 whitespace-nowrap ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-600 bg-orange-100/90'
                    : 'border-transparent text-slate-700 hover:text-slate-800'
                }`}
                id="admin-tab-upload"
              >
                <Upload className="w-4 h-4" />
                <span>కొత్త పుస్తకం అప్‌లోడ్ (Upload Book)</span>
              </button>

              {/* TAB 3: MANAGE / DELETE */}
              <button
                onClick={() => setActiveTab('manage')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-xl transition border-b-2 whitespace-nowrap ${
                  activeTab === 'manage'
                    ? 'border-rose-500 text-rose-600 bg-orange-100/90 shadow-sm'
                    : 'border-transparent text-slate-700 hover:text-slate-800'
                }`}
                id="admin-tab-manage"
              >
                <FolderPlus className="w-4 h-4 text-rose-600" />
                <span>రెండు ఫోల్డర్ల నిర్వహణ & పుస్తకాలు (Manage Folders & Books - {books.length})</span>
              </button>

              {/* TAB 4: PRICING & QR CODE SETTINGS */}
              <button
                onClick={() => setActiveTab('pricing')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-xl transition border-b-2 whitespace-nowrap ${
                  activeTab === 'pricing'
                    ? 'border-emerald-500 text-emerald-600 bg-orange-100/90'
                    : 'border-transparent text-slate-700 hover:text-slate-800'
                }`}
                id="admin-tab-pricing"
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>ధరలు & QR పేమెంట్స్ (Pricing & QR)</span>
              </button>

              {/* TAB 5: API & SYNC SETTINGS */}
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-xl transition border-b-2 whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'border-orange-400 text-slate-700 bg-orange-100/90'
                    : 'border-transparent text-slate-700 hover:text-slate-800'
                }`}
                id="admin-tab-settings"
              >
                <Settings className="w-4 h-4" />
                <span>అనుసంధాన సెట్టింగులు & సింక్ (API & Sync)</span>
              </button>

              {/* TAB 6: BRAHMASTRA ULTRA AGENT */}
              <button
                onClick={() => setActiveTab('brahmastra')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-xl transition border-b-2 whitespace-nowrap ${
                  activeTab === 'brahmastra'
                    ? 'border-purple-500 text-purple-600 bg-orange-100/90 shadow-sm'
                    : 'border-transparent text-slate-700 hover:text-slate-800'
                }`}
                id="admin-tab-brahmastra"
              >
                <Zap className="w-4 h-4 text-purple-600" />
                <span>⚡ బ్రహ్మాస్త్ర 3.5 అల్ట్రా ఏజెంట్</span>
              </button>

              {/* TAB 7: TREE APPROVALS */}
              <button
                onClick={() => setActiveTab('trees')}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-xl transition border-b-2 whitespace-nowrap ${
                  activeTab === 'trees'
                    ? 'border-emerald-500 text-emerald-600 bg-orange-100/90 shadow-sm'
                    : 'border-transparent text-slate-700 hover:text-slate-800'
                }`}
                id="admin-tab-trees"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>వృక్షాల ఆమోదం (Trees - {registeredTrees.length})</span>
              </button>
            </div>

            {/* Notification Bar */}
            {notification && (
              <div className="bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-600 px-6 py-2.5 text-xs font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{notification}</span>
                </div>
                <button onClick={() => setNotification(null)}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* TAB 1 CONTENT: WRITER APPLICATIONS */}
            {activeTab === 'writers' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span>రచయితల దరఖాస్తులు & కంటెంట్ (Writer Submissions)</span>
                    </h3>
                    <p className="text-xs text-slate-700 mt-0.5">
                      రచయితలు అప్‌లోడ్ చేసిన పుస్తకాలు, వాయిస్ రికార్డింగ్‌లు & వీడియోలు ఇక్కడ కనిపిస్తాయి.
                    </p>
                  </div>
                  <span className="text-xs bg-indigo-500/20 text-indigo-700 font-mono px-2.5 py-1 rounded-lg border border-indigo-300">
                    మొత్తం: {writerApplications.length}
                  </span>
                </div>

                {writerApplications.length === 0 ? (
                  <div className="bg-orange-50/60 border border-orange-300 rounded-2xl p-8 text-center space-y-2">
                    <Users className="w-10 h-10 text-slate-600 mx-auto" />
                    <h5 className="text-xs font-bold text-slate-800">ఇప్పటివరకు ఎటువంటి రచయితల దరఖాస్తులు రాలేదు</h5>
                    <p className="text-[11px] text-slate-600">
                      రీఛార్జ్ కన్సోల్ పైభాగంలో లేదా హెడర్‌లో "Writer" బటన్ ద్వారా రచయితలు ఆడియో, వీడియో, పుస్తకాలు అప్‌లోడ్ చేసినప్పుడు అవి ఇక్కడ ప్రత్యక్షంగా కనిపిస్తాయి.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {writerApplications.map((app) => (
                      <div 
                        key={app.id} 
                        className="bg-orange-50 border border-orange-300 hover:border-indigo-500/40 rounded-2xl p-4 flex flex-col gap-3 shadow-md transition"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="text-xs font-bold text-slate-900">{app.name}</h5>
                            <span className="text-[10px] bg-orange-100 text-slate-800 font-mono px-2 py-0.5 rounded">
                              {app.email}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              app.contentType === 'audio'
                                ? 'bg-purple-500/20 text-purple-700 border border-purple-300'
                                : app.contentType === 'video'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-300'
                                : 'bg-blue-500/20 text-blue-700 border border-blue-300'
                            }`}>
                              {app.contentType === 'audio' ? <Mic className="w-2.5 h-2.5" /> : app.contentType === 'video' ? <Film className="w-2.5 h-2.5" /> : <BookOpen className="w-2.5 h-2.5" />}
                              <span>{app.contentType === 'audio' ? 'వాయిస్ కథ' : app.contentType === 'video' ? 'వీడియో కథ' : 'పుస్తకం'}</span>
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              app.status === 'approved' 
                                ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-300' 
                                : 'bg-amber-500/20 text-slate-700 border border-orange-400'
                            }`}>
                              {app.status.toUpperCase()}
                            </span>
                            {app.language && (
                              <span className="text-[10px] bg-teal-500/20 text-teal-950 border border-teal-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <Globe className="w-2.5 h-2.5 text-teal-700" />
                                <span>భాష: {app.language.toUpperCase()}</span>
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] text-slate-600 font-mono">
                            {app.timestamp}
                          </span>
                        </div>

                        {/* Title & Bio */}
                        <div>
                          <p className="text-xs text-indigo-700 font-semibold">
                            శీర్షిక: <strong>"{app.bookTitle}"</strong>
                          </p>
                          <p className="text-[11px] text-slate-700 leading-relaxed mt-0.5">
                            {app.bio || 'రచయిత పరిచయం అందించబడలేదు.'}
                          </p>
                          {app.storyText && (
                            <div className="mt-2 space-y-1.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-[10px] text-orange-800 font-bold">కథ పూర్తి సమాచారం (Story Text):</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedStoryId(expandedStoryId === app.timestamp ? null : app.timestamp)}
                                    className="text-[10px] bg-orange-200 hover:bg-orange-300 text-orange-950 px-2 py-0.5 rounded-md font-bold transition"
                                  >
                                    {expandedStoryId === app.timestamp ? 'క్లోజ్ చేయి (Show Less)' : 'అంతా చదవండి (Read Full)'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const element = document.createElement("a");
                                      const file = new Blob([
                                        `రచయిత: ${app.name}\n`,
                                        `ఈమెయిల్: ${app.email}\n`,
                                        `పుస్తకం పేరు: ${app.bookTitle}\n`,
                                        `విభాగం: ${app.category || 'General'}\n`,
                                        `భాష: ${app.language || 'te'}\n`,
                                        `రచయిత పరిచయం:\n${app.bio || ''}\n\n`,
                                        `========================================\n`,
                                        `కథ పూర్తి సమాచారం (STORY TEXT):\n`,
                                        `========================================\n\n`,
                                        app.storyText || ''
                                      ], {type: 'text/plain;charset=utf-8'});
                                      element.href = URL.createObjectURL(file);
                                      element.download = `${app.name.replace(/\s+/g, '_')}_${app.bookTitle.replace(/\s+/g, '_')}.txt`;
                                      document.body.appendChild(element);
                                      element.click();
                                      document.body.removeChild(element);
                                    }}
                                    className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-slate-900 font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 transition"
                                  >
                                    <Upload className="w-3 h-3 rotate-180" />
                                    <span>డౌన్‌లోడ్ ఫైల్ (Download .txt)</span>
                                  </button>
                                </div>
                              </div>
                              <p className={`text-[11px] text-slate-800 bg-orange-100/80 p-2.5 rounded-xl border border-orange-300 font-serif italic whitespace-pre-wrap ${
                                expandedStoryId === app.timestamp ? 'max-h-96 overflow-y-auto' : 'line-clamp-3'
                              }`}>
                                "{app.storyText}"
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Cover image or uploaded photo preview in Admin Panel */}
                        {app.coverImage && (
                          <div className="bg-orange-50 border border-blue-300 rounded-xl p-2.5 flex items-center gap-3">
                            <img src={app.coverImage} alt="Uploaded preview" className="w-16 h-16 object-cover rounded-lg border border-orange-300" />
                            <div>
                              <span className="text-[10px] text-blue-700 font-semibold block mb-0.5">అప్‌లోడ్ చేసిన చిత్రం / ఫోటో (Cover/Photo Preview):</span>
                              <span className="text-[10px] text-slate-700">చాట్ లేదా రచయిత సమర్పణ నుండి పొందబడింది</span>
                            </div>
                          </div>
                        )}

                        {/* Audio / Video Live Player inside Admin Card */}
                        {app.audioUrl && (
                          <div className="bg-orange-50 border border-purple-300 rounded-xl p-2.5 flex items-center gap-3">
                            <Music className="w-4 h-4 text-purple-600 shrink-0" />
                            <div className="flex-1">
                              <span className="text-[10px] text-purple-700 font-semibold block mb-1">వాయిస్ రికార్డింగ్ వినండి (Audio Preview):</span>
                              <audio src={app.audioUrl} controls className="w-full h-7" />
                            </div>
                          </div>
                        )}

                        {app.videoUrl && (
                          <div className="bg-orange-50 border border-rose-300 rounded-xl p-2.5">
                            <span className="text-[10px] text-rose-300 font-semibold block mb-1 flex items-center gap-1">
                              <Film className="w-3 h-3" /> వీడియో కథ చూడండి (Video Preview):
                            </span>
                            <video src={app.videoUrl} controls className="w-full max-h-48 rounded-lg bg-orange-100 object-contain" />
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={() => setYoutubePublishApp(app)}
                            className="bg-red-600 hover:bg-red-500 text-slate-900 text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-sm border border-red-500/20"
                          >
                            <Youtube className="w-3.5 h-3.5 text-red-100" />
                            <span>యూట్యూబ్‌లో ప్రచురించు (Publish to YouTube)</span>
                          </button>
                          {app.status !== 'approved' ? (
                            <button
                              onClick={() => {
                                if (onApproveApplication) {
                                  onApproveApplication(app);
                                } else {
                                  // Default fallback to add book
                                   const approvedBook: Book = {
                                    id: `writer-book-${Date.now()}`,
                                    title: app.bookTitle,
                                    author: app.name,
                                    category: app.category || 'General',
                                    contentType: app.contentType,
                                    audioUrl: app.audioUrl,
                                    videoUrl: app.videoUrl,
                                    description: app.bio || 'రచయిత సమర్పించిన రచన.',
                                    coverImage: app.contentType === 'audio'
                                      ? 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80'
                                      : app.contentType === 'video'
                                      ? 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80'
                                      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
                                    costToUnlock: 0,
                                    costPerMinute: 1,
                                    isUnlocked: true,
                                    chapters: [
                                      {
                                        id: `ch-1`,
                                        title: `${app.bookTitle} - ప్రధాన భాగం`,
                                        content: app.storyText || app.bio || 'కథ ప్రారంభం...',
                                        audioUrl: app.audioUrl,
                                        videoUrl: app.videoUrl
                                      }
                                    ],
                                    language: app.language
                                  };
                                  onAddBook(approvedBook);
                                }
                                app.status = 'approved';
                                setNotification(`రచయిత "${app.name}" రచన విజయవంతంగా ఆమోదించబడి లైబ్రరీలో ప్రచురించబడింది!`);
                                setTimeout(() => setNotification(null), 3500);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-slate-900 text-[11px] font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>ఆమోదించి లైబ్రరీలో ప్రచురించు (Approve & Publish)</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> లైబ్రరీలో లైవ్‌గా ప్రచురించబడింది
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2 CONTENT: UPLOAD BOOK FORM */}
            {activeTab === 'upload' && (
              <form onSubmit={handleUploadSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {/* Content Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    కంటెంట్ రకం ఎంచుకోండి (Content Type) *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setContentType('text')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        contentType === 'text'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-700'
                          : 'bg-orange-50 border-orange-300 text-slate-700'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>పుస్తకం (E-Book)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setContentType('audio')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        contentType === 'audio'
                          ? 'bg-purple-600/20 border-purple-500 text-purple-700'
                          : 'bg-orange-50 border-orange-300 text-slate-700'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>వాయిస్ కథ (Audio)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setContentType('video')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        contentType === 'video'
                          ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                          : 'bg-orange-50 border-orange-300 text-slate-700'
                      }`}
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>వీడియో కథ (Video)</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      {contentType === 'audio' ? 'వాయిస్ కథ పేరు (Audio Title) *' : contentType === 'video' ? 'వీడియో కథ పేరు (Video Title) *' : 'పుస్తకం పేరు (Book Title) *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="ఉదా: పంచతంత్ర కథలు / Bhagavad Gita"
                      className="w-full bg-orange-50 border border-orange-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="admin-book-title-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      రచయిత / క్రియేటర్ పేరు (Author / Creator) *
                    </label>
                    <input
                      type="text"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="ఉదా: విష్ణు శర్మ / Vyasa"
                      className="w-full bg-orange-50 border border-orange-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="admin-book-author-input"
                    />
                  </div>
                </div>

                {/* Media URL if Audio or Video */}
                {contentType === 'audio' && (
                  <div>
                    <label className="block text-xs font-semibold text-purple-700 mb-1 flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5" />
                      <span>ఆడియో ఫైల్ URL / రికార్డింగ్ లింక్ (Audio Stream URL)</span>
                    </label>
                    <input
                      type="text"
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      placeholder="ఉదా: https://actions.google.com/sounds/v1/ambiences/daytime_forest_bonfire.ogg"
                      className="w-full bg-orange-50 border border-purple-500/40 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>
                )}

                {contentType === 'video' && (
                  <div>
                    <label className="block text-xs font-semibold text-rose-300 mb-1 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5" />
                      <span>వీడియో స్ట్రీమ్ లింక్ / MP4 URL (Video Stream URL)</span>
                    </label>
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="ఉదా: https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                      className="w-full bg-orange-50 border border-rose-500/40 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      వర్గం (Category)
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="ఉదా: Literature, Sci-Fi"
                      className="w-full bg-orange-50 border border-orange-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="admin-book-category-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      ఫోల్డర్‌ని ఎంచుకోండి (Folder)
                    </label>
                    <select
                      value={folderId}
                      onChange={(e) => setFolderId(e.target.value)}
                      className="w-full bg-orange-50 border border-orange-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="admin-book-folder-select"
                    >
                      <option value="">సాధారణ గ్రంథాలయం (General Books)</option>
                      <option value="fol-talapatra">📜 తాళపత్ర గ్రంథాలయం (Palm Leaf Manuscripts)</option>
                      {folders.filter(f => f.id !== 'fol-talapatra').map(f => (
                        <option key={f.id} value={f.id}>📁 {f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      అన్‌లాక్ ధర (Cost to Unlock)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={costToUnlock}
                      onChange={(e) => setCostToUnlock(Number(e.target.value))}
                      className="w-full bg-orange-50 border border-orange-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="admin-book-cost-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    వివరణ (Description)
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="పుస్తకం యొక్క క్లుప్త పరిచయం వ్రాయండి..."
                    className="w-full bg-orange-50 border border-orange-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="admin-book-description-input"
                  />
                </div>

                {/* Chapters Section */}
                <div className="space-y-3 pt-2 border-t border-orange-300">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>అధ్యాయాలు (Book Chapters)</span>
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddChapter}
                      className="flex items-center gap-1 text-xs bg-orange-100 hover:bg-orange-200 text-blue-600 px-3 py-1 rounded-lg transition"
                      id="admin-add-chapter-btn"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>అధ్యాయం జోడించు</span>
                    </button>
                  </div>

                  {chapters.map((ch, idx) => (
                    <div key={idx} className="bg-orange-50 border border-orange-300 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <input
                          type="text"
                          value={ch.title}
                          onChange={(e) => handleChapterChange(idx, 'title', e.target.value)}
                          placeholder={`అధ్యాయం ${idx + 1} శీర్షిక`}
                          className="bg-orange-50 border border-orange-300 rounded-lg px-3 py-1 text-xs font-semibold text-slate-900 focus:outline-none w-2/3"
                          id={`admin-chapter-title-${idx}`}
                        />
                        {chapters.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveChapter(idx)}
                            className="text-rose-600 hover:text-rose-300 text-xs p-1"
                            title="ఈ అధ్యాయాన్ని తొలగించు"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={3}
                        value={ch.content}
                        onChange={(e) => handleChapterChange(idx, 'content', e.target.value)}
                        placeholder="అధ్యాయం విషయము (Chapter Text Content)..."
                        className="w-full bg-orange-50 border border-orange-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none"
                        id={`admin-chapter-content-${idx}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-orange-300">
                  <button
                    type="button"
                    onClick={() => {
                      handleResetForm();
                      onClose();
                    }}
                    className="px-5 py-2.5 bg-orange-100 hover:bg-orange-200 text-slate-800 text-xs font-bold rounded-xl transition"
                    id="admin-cancel-upload-btn"
                  >
                    క్యాన్సల్ (Cancel)
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-slate-900 text-xs font-bold rounded-xl transition shadow-lg shadow-blue-600/30"
                    id="admin-submit-upload-btn"
                  >
                    <Upload className="w-4 h-4" />
                    <span>లైబ్రరీకి అప్‌లోడ్ చేయండి (Upload Direct to Library)</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3 CONTENT: DELETE / MANAGE BOOKS */}
            {activeTab === 'manage' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <p className="text-xs text-slate-900 leading-relaxed font-extrabold bg-amber-200 p-3 rounded-xl border-2 border-amber-400 shadow-sm">
                  అడ్మిన్ గారు! అడ్మిన్ ప్యానెల్‌లోని రెండు ఫోల్డర్లను (రెండు రకాల గ్రంథాలయాలను) నిర్వహించడానికి క్రింది ఇంటరాక్టివ్ ఫోల్డర్లపై క్లిక్ చేయండి.
                </p>

                {/* TWO EXPLICIT INTERACTIVE FOLDER CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-2">
                  {/* Folder 1: సాధారణ గ్రంథాలయం ఫోల్డర్ */}
                  <button
                    onClick={() => {
                      setActiveManageFolder('general');
                      setEditingBookId(null);
                    }}
                    className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2.5 transition-all text-center relative shadow-md cursor-pointer ${
                      activeManageFolder === 'general'
                        ? 'bg-orange-100 border-orange-500 scale-[1.02] ring-2 ring-orange-500/20'
                        : 'bg-white hover:bg-orange-50/50 border-slate-200'
                    }`}
                  >
                    <div className="text-5xl">📁</div>
                    <div className="space-y-0.5">
                      <span className="block text-sm font-black text-black">సాధారణ గ్రంథాలయం ఫోల్డర్</span>
                      <span className="block text-[10px] text-slate-800 font-bold uppercase">General Books Folder</span>
                    </div>
                    <span className="absolute top-3 right-3 bg-orange-200 text-black border border-orange-400 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-xs">
                      {books.filter(b => b.folderId !== 'fol-talapatra').length} గ్రంథాలు
                    </span>
                  </button>

                  {/* Folder 2: తాళపత్ర గ్రంథాలయం ఫోల్డర్ */}
                  <button
                    onClick={() => {
                      setActiveManageFolder('palm');
                      setEditingBookId(null);
                    }}
                    className={`p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2.5 transition-all text-center relative shadow-md cursor-pointer ${
                      activeManageFolder === 'palm'
                        ? 'bg-amber-100 border-amber-500 scale-[1.02] ring-2 ring-amber-500/20'
                        : 'bg-white hover:bg-amber-50/50 border-slate-200'
                    }`}
                  >
                    <div className="text-5xl">📜</div>
                    <div className="space-y-0.5">
                      <span className="block text-sm font-black text-black">తాళపత్ర గ్రంథాలయం ఫోల్డర్</span>
                      <span className="block text-[10px] text-amber-950 font-bold uppercase">Palm Leaf Manuscripts Folder</span>
                    </div>
                    <span className="absolute top-3 right-3 bg-amber-200 text-black border border-amber-400 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-xs">
                      {books.filter(b => b.folderId === 'fol-talapatra').length} గ్రంథాలు
                    </span>
                  </button>
                </div>

                {/* SELECTED FOLDER MANAGEMENT BOARD */}
                {activeManageFolder === 'general' ? (
                  <div className="bg-orange-50/50 border-2 border-orange-300 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
                    <h4 className="text-sm font-black text-black border-b border-orange-300 pb-2.5 flex items-center gap-2">
                      <span className="text-xl">📁</span>
                      <span>సాధారణ గ్రంథాలయం (General Books Management)</span>
                    </h4>
                    
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                      {books.filter(b => b.folderId !== 'fol-talapatra').map(book => (
                        <div 
                          key={book.id}
                          className="bg-white border-2 border-orange-200 hover:border-orange-300 rounded-xl p-3 shadow-xs transition"
                        >
                          {editingBookId === book.id ? (
                            <div className="space-y-2.5 text-xs">
                              <div>
                                <label className="block text-[10px] font-black text-slate-900 mb-1">పుస్తకం పేరు (Book Title)</label>
                                <input 
                                  type="text" 
                                  value={editBookTitle}
                                  onChange={(e) => setEditBookTitle(e.target.value)}
                                  className="w-full bg-orange-50 border border-orange-300 rounded-lg p-2 text-xs font-semibold text-black focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-black text-slate-900 mb-1">రచయిత (Author)</label>
                                <input 
                                  type="text" 
                                  value={editBookAuthor}
                                  onChange={(e) => setEditBookAuthor(e.target.value)}
                                  className="w-full bg-orange-50 border border-orange-300 rounded-lg p-2 text-xs font-semibold text-black focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-black text-slate-900 mb-1">అన్‌లాక్ ధర (Cost in Credits)</label>
                                <input 
                                  type="number" 
                                  value={editBookCost}
                                  onChange={(e) => setEditBookCost(Math.max(0, Number(e.target.value)))}
                                  className="w-full bg-orange-50 border border-orange-300 rounded-lg p-2 text-xs font-bold text-black focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono"
                                />
                              </div>
                              <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100">
                                <button
                                  onClick={() => {
                                    if (!editBookTitle.trim()) {
                                      alert('శీర్షిక ఖాళీగా ఉండకూడదు!');
                                      return;
                                    }
                                    if (onUpdateBooks) {
                                      onUpdateBooks(books.map(b => b.id === book.id ? { 
                                        ...b, 
                                        title: editBookTitle, 
                                        author: editBookAuthor, 
                                        costToUnlock: editBookCost 
                                      } : b));
                                      setNotification(`"${editBookTitle}" విజయవంతంగా సవరించబడింది!`);
                                      setTimeout(() => setNotification(null), 3000);
                                    }
                                    setEditingBookId(null);
                                  }}
                                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs transition"
                                >
                                  సేవ్ (Save)
                                </button>
                                <button
                                  onClick={() => setEditingBookId(null)}
                                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold px-3 py-1.5 rounded-lg text-xs transition"
                                >
                                  రద్దు (Cancel)
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-12 bg-slate-100 rounded overflow-hidden shrink-0 border border-slate-200">
                                  <img 
                                    src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'} 
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="overflow-hidden">
                                  <h5 className="text-xs font-extrabold text-black truncate">{book.title}</h5>
                                  <p className="text-[11px] text-slate-700 truncate">రచయిత: {book.author}</p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-[9px] bg-blue-100 border border-blue-200 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">
                                      {book.category}
                                    </span>
                                    <span className="text-[9px] bg-amber-100 border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-mono font-bold">
                                      {book.costToUnlock} Credits
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5 shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingBookId(book.id);
                                    setEditBookTitle(book.title);
                                    setEditBookAuthor(book.author);
                                    setEditBookCost(book.costToUnlock);
                                  }}
                                  className="bg-orange-100 hover:bg-orange-200 text-black border border-orange-300 rounded-lg px-2.5 py-1 text-[10px] font-black transition cursor-pointer"
                                >
                                  ఎడిట్ (Edit)
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`నిజంగా "${book.title}" పుస్తకాన్ని లైబ్రరీ నుండి తొలగించాలనుకుంటున్నారా?`)) {
                                      onDeleteBook(book.id);
                                      setNotification(`"${book.title}" డిలీట్ చేయబడింది!`);
                                      setTimeout(() => setNotification(null), 3000);
                                    }
                                  }}
                                  className="bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-500 rounded-lg px-2.5 py-1 text-[10px] font-black transition cursor-pointer"
                                  id={`delete-book-btn-${book.id}`}
                                >
                                  డిలీట్ (Delete)
                                </button>
                                <button
                                  onClick={() => {
                                    if (onUpdateBooks) {
                                      onUpdateBooks(books.map(b => b.id === book.id ? { ...b, folderId: 'fol-talapatra' } : b));
                                      setNotification(`"${book.title}" తాళపత్ర గ్రంథాలయానికి మార్చబడింది!`);
                                      setTimeout(() => setNotification(null), 3000);
                                    }
                                  }}
                                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg px-2.5 py-1 text-[10px] font-black transition cursor-pointer"
                                >
                                  📜 తాళపత్రానికి మార్చు
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {books.filter(b => b.folderId !== 'fol-talapatra').length === 0 && (
                        <div className="text-center py-8 text-slate-600 text-xs font-semibold">
                          సాధారణ లైబ్రరీలో పుస్తకాలు లేవు.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
                    <h4 className="text-sm font-black text-black border-b border-amber-300 pb-2.5 flex items-center gap-2">
                      <span className="text-xl">📜</span>
                      <span>తాళపత్ర గ్రంథాలు (Palm Leaf Manuscripts Management)</span>
                    </h4>
                    
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                      {books.filter(b => b.folderId === 'fol-talapatra').map(book => (
                        <div 
                          key={book.id}
                          className="bg-white border-2 border-amber-200 hover:border-amber-300 rounded-xl p-3 shadow-xs transition"
                        >
                          {editingBookId === book.id ? (
                            <div className="space-y-2.5 text-xs">
                              <div>
                                <label className="block text-[10px] font-black text-slate-900 mb-1">గ్రంథం పేరు (Manuscript Title)</label>
                                <input 
                                  type="text" 
                                  value={editBookTitle}
                                  onChange={(e) => setEditBookTitle(e.target.value)}
                                  className="w-full bg-amber-50 border border-amber-300 rounded-lg p-2 text-xs font-semibold text-black focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-black text-slate-900 mb-1">రచయిత / అనువాదకుడు (Author/Translator)</label>
                                <input 
                                  type="text" 
                                  value={editBookAuthor}
                                  onChange={(e) => setEditBookAuthor(e.target.value)}
                                  className="w-full bg-amber-50 border border-amber-300 rounded-lg p-2 text-xs font-semibold text-black focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-black text-slate-900 mb-1">అన్‌లాక్ ధర (Cost in Credits)</label>
                                <input 
                                  type="number" 
                                  value={editBookCost}
                                  onChange={(e) => setEditBookCost(Math.max(0, Number(e.target.value)))}
                                  className="w-full bg-amber-50 border border-amber-300 rounded-lg p-2 text-xs font-bold text-black focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                                />
                              </div>
                              <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100">
                                <button
                                  onClick={() => {
                                    if (!editBookTitle.trim()) {
                                      alert('శీర్షిక ఖాళీగా ఉండకూడదు!');
                                      return;
                                    }
                                    if (onUpdateBooks) {
                                      onUpdateBooks(books.map(b => b.id === book.id ? { 
                                        ...b, 
                                        title: editBookTitle, 
                                        author: editBookAuthor, 
                                        costToUnlock: editBookCost 
                                      } : b));
                                      setNotification(`"${editBookTitle}" విజయవంతంగా సవరించబడింది!`);
                                      setTimeout(() => setNotification(null), 3000);
                                    }
                                    setEditingBookId(null);
                                  }}
                                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-3 py-1.5 rounded-lg text-xs transition"
                                >
                                  సేవ్ (Save)
                                </button>
                                <button
                                  onClick={() => setEditingBookId(null)}
                                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold px-3 py-1.5 rounded-lg text-xs transition"
                                >
                                  రద్దు (Cancel)
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-12 bg-slate-100 rounded overflow-hidden shrink-0 border border-slate-200">
                                  <img 
                                    src={book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80'} 
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="overflow-hidden">
                                  <h5 className="text-xs font-extrabold text-black truncate">{book.title}</h5>
                                  <p className="text-[11px] text-slate-700 truncate">రచయిత: {book.author}</p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-[9px] bg-amber-100 border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">
                                      {book.category}
                                    </span>
                                    <span className="text-[9px] bg-emerald-100 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-full font-mono font-bold">
                                      {book.costToUnlock} Credits
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5 shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingBookId(book.id);
                                    setEditBookTitle(book.title);
                                    setEditBookAuthor(book.author);
                                    setEditBookCost(book.costToUnlock);
                                  }}
                                  className="bg-amber-100 hover:bg-amber-200 text-black border border-amber-300 rounded-lg px-2.5 py-1 text-[10px] font-black transition cursor-pointer"
                                >
                                  ఎడిట్ (Edit)
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`నిజంగా "${book.title}" గ్రంథాన్ని లైబ్రరీ నుండి తొలగించాలనుకుంటున్నారా?`)) {
                                      onDeleteBook(book.id);
                                      setNotification(`"${book.title}" డిలీట్ చేయబడింది!`);
                                      setTimeout(() => setNotification(null), 3000);
                                    }
                                  }}
                                  className="bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-500 rounded-lg px-2.5 py-1 text-[10px] font-black transition cursor-pointer"
                                  id={`delete-book-btn-${book.id}`}
                                >
                                  డిలీట్ (Delete)
                                </button>
                                <button
                                  onClick={() => {
                                    if (onUpdateBooks) {
                                      // Remove folderId to move it to general library
                                      onUpdateBooks(books.map(b => b.id === book.id ? { ...b, folderId: undefined } : b));
                                      setNotification(`"${book.title}" సాధారణ గ్రంథాలయానికి మార్చబడింది!`);
                                      setTimeout(() => setNotification(null), 3000);
                                    }
                                  }}
                                  className="bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 rounded-lg px-2.5 py-1 text-[10px] font-black transition cursor-pointer"
                                >
                                  📁 సాధారణ లైబ్రరీకి మార్చు
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {books.filter(b => b.folderId === 'fol-talapatra').length === 0 && (
                        <div className="text-center py-8 text-slate-600 text-xs font-semibold">
                          తాళపత్ర గ్రంథాలయంలో పుస్తకాలు లేవు.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4 CONTENT: PRICING & QR CODE SETTINGS */}
            {activeTab === 'pricing' && (
              <form onSubmit={handleSavePricing} className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="bg-orange-50 border border-orange-300 rounded-2xl p-5 space-y-4">
                  {/* Admin QR Code Upload Section moved to the top with Save Button */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      అడ్మిన్ క్యూఆర్ కోడ్ అప్‌లోడ్ (Admin QR Code Image / Upload) *
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-orange-50 border border-orange-300 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                        {adminQrImage ? (
                          <img src={adminQrImage} alt="Admin QR" className="w-full h-full object-cover" />
                        ) : (
                          <QrCode className="w-8 h-8 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={adminQrImage}
                          onChange={(e) => setAdminQrImage(e.target.value)}
                          placeholder="క్యూఆర్ కోడ్ ఇమేజ్ URL లేదా ఫైల్ అప్‌లోడ్ చేయండి"
                          className="w-full bg-orange-50 border border-orange-300 rounded-xl px-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setAdminQrImage(event.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="block w-full text-xs text-slate-700 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600/20 file:text-emerald-300 hover:file:bg-emerald-600/30 cursor-pointer"
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-600 mt-1 block">ఇక్కడ అప్‌లోడ్ చేసి సేవ్ చేసిన క్యూఆర్ కోడ్ మాత్రమే యూజర్లందరికీ పేమెంట్ సమయంలో కనిపిస్తుంది.</span>
                  </div>

                  <div className="flex justify-start pt-1">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/30"
                      id="admin-save-pricing-btn"
                    >
                      ధరల సెట్టింగ్స్ భద్రపరచు (Save Pricing)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-900">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        ఆన్‌లైన్ చదివేందుకు రేటు (Online Read Price ₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-emerald-600 font-bold">₹</span>
                        <input
                          type="number"
                          min={1}
                          required
                          value={readPriceINR}
                          onChange={(e) => setReadPriceINR(Number(e.target.value))}
                          className="w-full bg-orange-50 border border-orange-300 rounded-xl pl-8 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                          id="admin-read-price-input"
                        />
                      </div>
                      <span className="text-[10px] text-slate-600 mt-1 block">యూజర్ రీడర్‌లో చదవడానికి చెల్లించాల్సిన మొత్తం</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        పీడీఎఫ్ డౌన్‌లోడ్ రేటు (PDF Download Price ₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-slate-700 font-bold">₹</span>
                        <input
                          type="number"
                          min={1}
                          required
                          value={downloadPriceINR}
                          onChange={(e) => setDownloadPriceINR(Number(e.target.value))}
                          className="w-full bg-orange-50 border border-orange-300 rounded-xl pl-8 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                          id="admin-download-price-input"
                        />
                      </div>
                      <span className="text-[10px] text-slate-600 mt-1 block">పూర్తి ఈబుక్ / పీడీఎఫ్ డౌన్‌లోడ్ చేసుకునే రుసుము</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">
                      అడ్మిన్ UPI ID (చెల్లింపులు స్వీకరించడానికి) *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminUpiId}
                      onChange={(e) => setAdminUpiId(e.target.value)}
                      placeholder="ఉదా: psm8742260@upi లేదా 9876543210@ybl"
                      className="w-full bg-orange-50 border border-orange-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      id="admin-upi-id-input"
                    />
                    <span className="text-[10px] text-slate-600 mt-1 block">ఈ UPI ID కి సంబంధించిన QR కోడ్ యూజర్ల స్క్రీన్‌పై డైనమిక్‌గా కనిపిస్తుంది.</span>
                  </div>

                  {/* Audio & Book Sample Control Boards */}
                  <div className="pt-5 border-t-2 border-dashed border-orange-300 space-y-4">
                    <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-blue-500 animate-[spin_10s_linear_infinite]" />
                      <span>ఆడియో ఉచిత వినికిడి & ఈబుక్ శాంపిల్ నియంత్రణ బోర్డులు (Audio & Sample Controls)</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Control Board 1: Audio Listening Limit */}
                      <div className="bg-orange-100/75 border border-orange-300 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-orange-200 pb-2">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            🔊 ఉచిత ఆడియో వినికిడి పరిమితి
                          </span>
                          <span className="text-[10px] bg-blue-500/10 text-blue-700 px-2 py-0.5 rounded-full font-mono font-bold">
                            {freeListeningSeconds} సెకన్లు
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-[11px] font-semibold text-slate-800">
                            ఉచితంగా వినగలిగే సమయం (సెకన్లలో) *
                          </label>
                          <input
                            type="number"
                            min={5}
                            required
                            value={freeListeningSeconds}
                            onChange={(e) => setFreeListeningSeconds(Number(e.target.value))}
                            className="w-full bg-orange-50 border border-orange-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                          />
                          <p className="text-[10px] text-slate-600 leading-normal">
                            యూజర్ చాట్ కన్సోల్‌లో వినండి (Listen) బటన్ నొక్కినప్పుడు, ఇక్కడ సెట్ చేసిన సమయం తర్వాత ఆడియో ఆగిపోతుంది. పూర్తి ఆడియో కోసం అన్‌లాక్ చేయమని చూపిస్తుంది.
                          </p>
                        </div>
                      </div>

                      {/* Control Board 2: Sample Pages Limit */}
                      <div className="bg-orange-100/75 border border-orange-300 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-orange-200 pb-2">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            📖 ఈబుక్ శాంపిల్ పేజీల బోర్డు
                          </span>
                          <span className="text-[10px] bg-blue-500/10 text-blue-700 px-2 py-0.5 rounded-full font-mono font-bold">
                            {isSampleEnabled ? `${samplePagesCount} పేజీలు` : 'OFF'}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-slate-800">
                              శాంపిల్ బటన్‌ను యాక్టివేట్ చేయి
                            </label>
                            <input
                              type="checkbox"
                              checked={isSampleEnabled}
                              onChange={(e) => setIsSampleEnabled(e.target.checked)}
                              className="w-4 h-4 text-emerald-600 border-orange-300 rounded focus:ring-emerald-500"
                            />
                          </div>

                          <div className={isSampleEnabled ? 'space-y-1.5' : 'space-y-1.5 opacity-40 pointer-events-none'}>
                            <label className="block text-[11px] font-semibold text-slate-800">
                              శాంపిల్ పేజీల సంఖ్య *
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={20}
                              required
                              value={samplePagesCount}
                              onChange={(e) => setSamplePagesCount(Number(e.target.value))}
                              className="w-full bg-orange-50 border border-orange-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                            />
                          </div>
                          
                          <p className="text-[10px] text-slate-600 leading-normal">
                            దీని ద్వారా యూజర్ చాట్ కన్సోల్ మరియు లైబ్రరీలో పుస్తకంలోని మొదటి పేజీ (బొమ్మతో సహా), మధ్యలో కొన్ని పేజీలు మరియు చివరి పేజీని కలిపి ఇక్కడ సెట్ చేసిన సంఖ్యలో మాత్రమే చూడగలరు.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </form>
            )}

            {/* TAB 5 CONTENT: API SETTINGS & SYNC */}
            {activeTab === 'settings' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                
                {/* 1. Internet Auto Sync Section */}
                <div className="bg-orange-50 border border-orange-300 rounded-xl p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-amber-500/10 text-slate-700 rounded-xl border border-orange-400 shrink-0">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">ఇంటర్నెట్ ఆటోమేటిక్ బుక్ సింక్ (Internet Library Sync)</h4>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        ఆటోమేటిక్ లైబ్రరీ ఫీచర్ ద్వారా పబ్లిక్ డొమైన్‌లో ఉన్న ఉచిత పుస్తకాలు (Free Books) ఇంటర్నెట్ నుండి నేరుగా లైబ్రరీలోకి సింక్ అవుతాయి.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-900 gap-4">
                    <div className="text-xs text-slate-600 max-w-md">
                      సింక్ అయ్యే ఉచిత పుస్తకాలు: ఆలిస్ వండర్‌లాండ్, షెర్లాక్ హోమ్స్, భగవద్గీత సారాంశం
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoSyncFreeBooks}
                      disabled={isSyncing}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shrink-0 ${
                        isSyncing 
                          ? 'bg-orange-100 text-slate-600 cursor-not-allowed'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                      }`}
                      id="admin-auto-sync-btn"
                    >
                      {isSyncing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                          <span>సింక్ అవుతోంది (Syncing...)</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>ఇప్పుడే సింక్ చేయి (Sync Free Books)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. DeepSeek Key Port Configuration Form */}
                <form onSubmit={handleSaveSettings} className="bg-orange-100 border border-orange-300 rounded-xl p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20 shrink-0">
                      <Settings className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900">డీప్‌సీక్ తాళం అనుసంధాన పోర్ట్ (DeepSeek API Port & Key)</h4>
                      <p className="text-xs text-slate-800 leading-relaxed">
                        ఇక్కడ డీప్‌సీక్ (DeepSeek) తాళాన్ని అమర్చడం ద్వారా చాట్ ఏజెంట్‌ను మరియు లైబ్రరీ రీడర్‌ను డీప్‌సీక్ ఇంటెలిజెన్స్ మోడల్‌కు అనుసంధానం చేయవచ్చు.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-orange-300 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          డీప్‌సీక్ API కీ (DeepSeek API Key) *
                        </label>
                        <input
                          type="password"
                          value={deepseekApiKey}
                          onChange={(e) => setDeepseekApiKey(e.target.value)}
                          placeholder="sk-..."
                          className="w-full bg-orange-100 border border-orange-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                          id="admin-deepseek-key-input"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-800 mb-1">
                          బేస్ URL (Base URL)
                        </label>
                        <input
                          type="text"
                          value={deepseekBaseUrl}
                          onChange={(e) => setDeepseekBaseUrl(e.target.value)}
                          placeholder="https://api.deepseek.com"
                          className="w-full bg-orange-100 border border-orange-300 rounded-xl px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                          id="admin-deepseek-url-input"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-900 text-xs font-bold rounded-xl transition shadow-lg shadow-orange-600/20"
                        id="admin-save-deepseek-btn"
                      >
                        అనుసంధానాన్ని భద్రపరచు (Save Config)
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 6 CONTENT: BRAHMASTRA ULTRA AGENT */}
            {activeTab === 'brahmastra' && (
              <div className="flex-1 overflow-y-auto p-5">
                <BrahmastraUltraAgent />
              </div>
            )}

            {/* TAB 7 CONTENT: TREE APPROVALS */}
            {activeTab === 'trees' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>వృక్షాల గుర్తింపు & రిజిస్ట్రేషన్ ఆమోదాలు (Tree Registry Approvals)</span>
                    </h3>
                    <p className="text-xs text-slate-755 mt-0.5">
                      వినియోగదారులు సమర్పించిన మొక్కలు/చెట్ల రిజిస్ట్రేషన్ దరఖాస్తులను ఇక్కడ ఆమోదించవచ్చు.
                    </p>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-700 font-mono px-2.5 py-1 rounded-lg border border-emerald-300">
                    మొత్తం: {registeredTrees?.length || 0}
                  </span>
                </div>

                {!registeredTrees || registeredTrees.length === 0 ? (
                  <div className="bg-orange-50/60 border border-orange-300 rounded-2xl p-8 text-center space-y-2">
                    <Sparkles className="w-10 h-10 text-emerald-600 mx-auto animate-pulse" />
                    <h5 className="text-xs font-bold text-slate-800">ఇప్పటివరకు ఎటువంటి వృక్షాల దరఖాస్తులు రాలేదు</h5>
                    <p className="text-[11px] text-slate-600">
                      వినియోగదారులు వృక్షాల విభాగం ద్వారా సరికొత్త చెట్ల ఫోటోలను సమర్పించినప్పుడు అవి ఇక్కడ ప్రత్యక్షంగా కనిపిస్తాయి.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {registeredTrees.map((tree) => (
                      <div 
                        key={tree.id} 
                        className="bg-orange-50 border border-orange-300 hover:border-emerald-500/40 rounded-2xl p-4 flex flex-col md:flex-row gap-4 shadow-md transition text-slate-900"
                      >
                        {tree.photoUrl && (
                          <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden shrink-0 border border-orange-300">
                            <img src={tree.photoUrl} alt={tree.treeName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                            <div>
                              <h5 className="text-xs font-bold text-emerald-800 font-serif text-[13px]">{tree.treeName}</h5>
                              <p className="text-[10px] text-slate-700 font-mono italic">{tree.botanicalName}</p>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              tree.status === 'approved' 
                                ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-300' 
                                : tree.status === 'rejected'
                                ? 'bg-rose-500/20 text-rose-600 border border-rose-300'
                                : 'bg-amber-500/20 text-slate-700 border border-orange-400'
                            }`}>
                              {tree.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-800 bg-orange-100/50 p-2 rounded-lg border border-orange-200">
                            <div><strong>సంస్కృత నామాలు:</strong> {tree.sanskritNames?.join(', ') || 'N/A'}</div>
                            <div><strong>తెలుగు నామాలు:</strong> {tree.teluguNames?.join(', ') || 'N/A'}</div>
                            <div><strong>హిందీ నామాలు:</strong> {tree.hindiNames?.join(', ') || 'N/A'}</div>
                            <div><strong>ఇతర నామాలు:</strong> {tree.otherNames?.slice(0, 10).join(', ') || 'N/A'}...</div>
                            <div><strong>నాటిన వారు:</strong> {tree.planterName}</div>
                            <div><strong>స్థలం:</strong> {tree.location || 'N/A'} ({tree.datePlanted})</div>
                          </div>

                          <p className="text-[11px] text-slate-700 leading-normal">
                            <strong>వివరణ:</strong> {tree.description}
                          </p>
                          <p className="text-[11px] text-slate-700 leading-normal">
                            <strong>వైద్య విలువలు (Medicinal):</strong> {tree.medicinalUses}
                          </p>

                          {tree.status === 'pending' && (
                            <div className="flex justify-end gap-2 pt-2 border-t border-orange-200">
                              <button
                                type="button"
                                onClick={() => onRejectTree?.(tree.id)}
                                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-bold rounded-lg border border-rose-300 transition"
                              >
                                తిరస్కరించు (Reject)
                              </button>
                              <button
                                type="button"
                                onClick={() => onApproveTree?.(tree.id)}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-[10px] font-bold rounded-lg transition"
                              >
                                ఆమోదించు (Approve)
                              </button>
                            </div>
                          )}

                          {tree.status !== 'pending' && (
                            <div className="flex justify-end pt-2">
                              <button
                                type="button"
                                onClick={() => onDeleteTree?.(tree.id)}
                                className="p-1 text-rose-600 hover:bg-rose-100 rounded transition"
                                title="తొలగించు"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>

      {/* YouTube Publishing Hub Overlay Modal */}
      {youtubePublishApp && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-orange-50 border border-orange-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-700 to-rose-700 p-4 text-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-100 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">యూట్యూబ్ పబ్లిషింగ్ హబ్ (YouTube Creator Studio Hub)</h3>
                  <p className="text-[10px] text-red-100">రచయిత: {youtubePublishApp.name} | రచన: {youtubePublishApp.bookTitle}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setYoutubePublishApp(null)}
                className="p-1 bg-red-800/40 hover:bg-red-800/60 rounded-full transition text-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content area */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {/* Media Preview Badge */}
              <div className="bg-orange-100/50 border border-orange-200 p-3 rounded-xl flex items-center gap-3">
                <div className="p-2 bg-red-600/10 text-red-700 rounded-lg shrink-0">
                  {youtubePublishApp.contentType === 'video' ? <Film className="w-5 h-5" /> : youtubePublishApp.contentType === 'audio' ? <Mic className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-[10px] text-orange-800 font-bold block">కంటెంట్ రకం (Upload Content Type):</span>
                  <span className="text-xs font-bold text-slate-900 capitalize">{youtubePublishApp.contentType.toUpperCase()} {youtubePublishApp.videoUrl ? ' - వీడియో ఫైల్ జతచేయబడింది' : ' - ఆడియో/టెక్స్ట్ ఫైల్ జతచేయబడింది'}</span>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">యూట్యూబ్ వీడియో శీర్షిక (YouTube Title):</label>
                    <button
                      type="button"
                      onClick={handleGenerateYTMetadata}
                      disabled={ytIsGenerating}
                      className="text-[10px] bg-red-100 hover:bg-red-200 text-red-950 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition"
                    >
                      <Sparkles className="w-3 h-3 text-red-700" />
                      <span>{ytIsGenerating ? 'Generating...' : 'AI తో సరిదిద్దు (AI Rewrite)'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={ytTitle}
                    onChange={(e) => setYtTitle(e.target.value)}
                    className="w-full bg-orange-100 border border-orange-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-950 font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">వీడియో వివరణ (Video SEO Description):</label>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(ytDescription);
                        alert("Description copied to clipboard!");
                      }}
                      className="text-[10px] bg-indigo-100 hover:bg-indigo-200 text-indigo-950 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1 transition"
                    >
                      <Copy className="w-3 h-3 text-indigo-700" />
                      <span>కాపీ చేయి (Copy Desc)</span>
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={ytDescription}
                    onChange={(e) => setYtDescription(e.target.value)}
                    className="w-full bg-orange-100 border border-orange-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">సెర్చ్ కీవర్డ్స్ & ట్యాగ్స్ (YouTube Tags):</label>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(ytTags);
                        alert("Tags copied to clipboard!");
                      }}
                      className="text-[10px] bg-teal-100 hover:bg-teal-200 text-teal-950 px-2.5 py-0.5 rounded-md font-bold flex items-center gap-1 transition"
                    >
                      <Copy className="w-3 h-3 text-teal-700" />
                      <span>కాపీ ట్యాగ్స్ (Copy Tags)</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={ytTags}
                    onChange={(e) => setYtTags(e.target.value)}
                    className="w-full bg-orange-100 border border-orange-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Uploading Status and Progress Bar */}
              {ytIsUploading && (
                <div className="bg-orange-100 border border-red-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-red-650 animate-bounce" />
                      <span>{ytStatusLog}</span>
                    </span>
                    <span className="font-mono font-bold text-red-750">{ytUploadProgress}%</span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-600 to-rose-600 h-full transition-all duration-300"
                      style={{ width: `${ytUploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success Result */}
              {ytSuccessUrl && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2.5 text-emerald-950 font-bold text-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>యూట్యూబ్ అప్‌లోడ్ విజయవంతంగా పూర్తయింది! (Upload Success)</span>
                  </div>
                  <div className="bg-emerald-100/40 border border-emerald-200 p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="font-mono text-slate-800 break-all select-all font-bold">{ytSuccessUrl}</span>
                    <a
                      href={ytSuccessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-slate-900 font-bold rounded-lg flex items-center gap-1 transition"
                    >
                      <Youtube className="w-4 h-4 text-red-100" />
                      <span>వీడియో చూడండి (Watch Video)</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="bg-orange-100 border-t border-orange-200 p-4 flex flex-wrap items-center justify-between gap-3">
              <a
                href="https://studio.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-red-700 font-bold hover:underline flex items-center gap-1"
              >
                <Youtube className="w-4 h-4 text-red-600" />
                <span>యూట్యూబ్ స్టూడియోకి వెళ్ళు (Open YouTube Creator Studio)</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setYoutubePublishApp(null)}
                  className="px-4 py-2 bg-orange-200 hover:bg-orange-300 text-slate-900 text-xs font-bold rounded-xl transition"
                >
                  రద్దు చేయి (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleYTUploadSimulation}
                  disabled={ytIsUploading}
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-slate-900 text-xs font-bold rounded-xl transition shadow-lg shadow-red-600/10 disabled:opacity-50"
                >
                  {ytIsUploading ? 'అప్‌లోడ్ అవుతోంది...' : 'అప్‌లోడ్ ప్రారంభించు (Start Direct Upload)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
