
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AppState } from './types';
import { GoogleGenAI } from "@google/genai";
import { generateTextImage, generateTextVideo, generateStyleSuggestion, generateTTS } from './services/geminiService';
import { getRandomStyle, fileToBase64, TYPOGRAPHY_SUGGESTIONS, createGifFromVideo } from './utils';
import { db, type ZekrHistory } from './services/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Paintbrush, Play, Type, Sparkles, Image as ImageIcon, X, Upload, Download, FileType, Wand2, Volume2, VolumeX, ChevronLeft, ChevronRight, ArrowLeft, Video as VideoIcon, Key, BookOpen, Heart, Moon, Languages, Github, Smartphone, Monitor, History, Trash2, Activity, RotateCcw, Edit2, AlertTriangle } from 'lucide-react';
import { SystemStatus } from './components/SystemStatus';

interface Video {
  id: string;
  title: string;
  videoUrl: string;
  description: string;
}

type Language = 'ar' | 'en';

const translations = {
  en: {
    brandName: "ZekrMotion",
    heroTitle1: "Divine",
    heroTitle2: "Typography",
    heroSubtitle: "Animate the sacred words. Experience spiritual depth through cinematic AI-generated motion graphics.",
    createBtn: "Create Your Zekr",
    inspiredBy: "Inspired by the Creator",
    byZooka: "By ZOOKA AI",
    tagline: "Empowering Spiritual Expression through Intelligence",
    apiKeyTitle: "Advanced API Access",
    apiKeyDesc: "To generate high-fidelity spiritual animations (using Veo 3.1), a paid Gemini API key is required. Ensure your Google Cloud project has billing enabled.",
    apiKeyFreeNote: "Free-tier keys are restricted from video generation.",
    apiKeySecureNote: "Your key is handled securely within this session.",
    cancel: "Cancel",
    selectKey: "Select Key",
    createHeader: "Create Motion Zekr",
    createDesc: "Generate beautiful spiritual reminders with cinematic animations.",
    labelSacredText: "Sacred Text",
    placeholderText: "Enter verse or remembrance...",
    surpriseMe: "Surprise Me",
    labelEnvironment: "Environment",
    suggestStyle: "Suggest Style",
    placeholderStyle: "e.g. 'Etched in emerald stone, glowing with soft golden morning light'...",
    createMasterpiece: "Create Masterpiece",
    labelTypography: "Typography",
    labelReferenceImage: "Reference Image",
    uploadStyle: "Upload Style",
    tip: "Tip: For Quranic verses, mentioning \"Arabic Calligraphy\" or \"Islamic geometric patterns\" in the style prompt yields divine results.",
    statusVisualizing: "Step 1/3: Visualizing Sacred Art...",
    statusAnimating: "Step 3/3: Manifesting Cinematic Motion...",
    statusPeace: "Peace.",
    backToGallery: "Back to Gallery",
    newMeditation: "New Meditation",
    saveGif: "Save GIF",
    saveVideo: "Save Video",
    issueOccurred: "An issue occurred",
    quotaExceeded: "Quota Exceeded. Please wait a moment before trying again.",
    tryAgain: "Retry Generation",
    editInput: "Edit Input",
    manifestingStillness: "Manifesting Stillness...",
    githubRepo: "Code Repository",
    labelAspectRatio: "Aspect Ratio",
    ratioLandscape: "Landscape (16:9)",
    ratioPortrait: "Portrait (9:16)",
    labelAudio: "Spiritual Audio",
    audioNone: "Silent",
    audioTTS: "Divine Voice",
    personalGallery: "My Meditations",
    noHistory: "Your spiritual journey begins here. Create your first Zekr.",
    deleteConfirm: "Delete this meditation?",
    statusAudio: "Step 2/3: Harmonizing Divine Voice...",
    introTitle: "Welcome to ZekrMotion",
    introSubtitle: "A cinematic journey into sacred typography",
    enterApp: "Enter Sanctuary",
    liveStatus: "Connected",
    recordingStatus: "Recording Spirit",
    contactTitle: "Let's Connect",
    contactDesc: "Share your spiritual journey or collaborate with us.",
    contactEmail: "Email Us",
    contactSocial: "Follow Us",
    outroTitle: "Peace be upon you",
    outroDesc: "May your journey be filled with light.",
    billingInfo: "Billing Setup Guide",
    billingLink: "https://ai.google.dev/gemini-api/docs/billing",
    billingRequirement: "A Google Cloud project with an active billing account is required for video generation.",
    premiumMode: "Premium Mode Active",
    freeTier: "Free Tier (Limited)",
    howToUseCredits: "How to use your Developer Benefits?",
    step1: "1. Apply your $500 Credits and $50 GenAI Credits in your benefits page.",
    step2: "2. Create an API Key in AI Studio linked to your 'studio-...' project.",
    step3: "3. Select that key here to unlock Veo 3.1, Imagen 4.0, and 4K generation.",
    spiritualInsights: "Spiritual Insights",
    searchingInsights: "Searching for deep meanings...",
    clearHistory: "Clear All History",
    confirmClear: "Are you sure you want to wipe all history? This cannot be undone.",
    systemHealth: "System Health",
    allSystemsGo: "All Systems Operational",
    resetApp: "Reset Application",
  },
  ar: {
    brandName: "ذكر موشن",
    heroTitle1: "خطوط",
    heroTitle2: "إلهية",
    heroSubtitle: "قم بتحريك الكلمات المقدسة. اختبر العمق الروحي من خلال الرسوم المتحركة السينمائية المولدة بالذكاء الاصطناعي.",
    createBtn: "اصنع ذكرك",
    inspiredBy: "بإلهام من الخالق",
    byZooka: "بواسطة زوكا AI",
    tagline: "تمكين التعبير الروحي من خلال الذكاء",
    apiKeyTitle: "وصول متقدم للواجهة البرمجية",
    apiKeyDesc: "لتوليد رسوم متحركة روحية عالية الدقة (باستخدام Veo 3.1)، يلزم وجود مفتاح Gemini API مدفوع. تأكد من تفعيل الفوترة في مشروع Google Cloud الخاص بك.",
    apiKeyFreeNote: "المفاتيح المجانية مقيدة من توليد الفيديو.",
    apiKeySecureNote: "يتم التعامل مع مفتاحك بأمان خلال هذه الجلسة.",
    cancel: "إلغاء",
    selectKey: "اختر المفتاح",
    createHeader: "إنشاء ذكر متحرك",
    createDesc: "قم بتوليد تذكيرات روحية جميلة مع رسوم متحركة سينمائية.",
    labelSacredText: "النص المقدس",
    placeholderText: "أدخل آية أو ذكراً...",
    surpriseMe: "فاجئني",
    labelEnvironment: "البيئة المحيطة",
    suggestStyle: "اقترح أسلوباً",
    placeholderStyle: "مثال: 'منقوش على حجر زمردي، يتوهج بضوء صباح ذهبي ناعم'...",
    createMasterpiece: "ابتكر التحفة",
    labelTypography: "فنون الخط",
    labelReferenceImage: "الصورة المرجعية",
    uploadStyle: "رفع نمط",
    tip: "نصيحة: بالنسبة للآيات القرآنية، فإن ذكر 'الخط العربي' أو 'الأنماط الهندسية الإسلامية' في وصف الأسلوب يعطي نتائج إلهية.",
    statusVisualizing: "المرحلة 1/3: تجسيد الفن المقدس...",
    statusAnimating: "المرحلة 3/3: تحريك المشهد السينمائي...",
    statusPeace: "سلام.",
    backToGallery: "العودة للمعرض",
    newMeditation: "تأمل جديد",
    saveGif: "حفظ GIF",
    saveVideo: "حفظ الفيديو",
    issueOccurred: "حدث خطأ ما",
    quotaExceeded: "تم تجاوز حد الاستخدام المسموح به. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.",
    tryAgain: "إعادة المحاولة",
    editInput: "تعديل المدخلات",
    manifestingStillness: "تجسيد السكون...",
    githubRepo: "مستودع الكود",
    labelAspectRatio: "نسبة العرض",
    ratioLandscape: "أفقي (16:9)",
    ratioPortrait: "عمودي (9:16)",
    labelAudio: "الصوت الروحي",
    audioNone: "صامت",
    audioTTS: "صوت إلهي",
    personalGallery: "تأملاتي الخاصة",
    noHistory: "رحلتك الروحية تبدأ هنا. اصنع ذكرك الأول.",
    deleteConfirm: "هل تريد حذف هذا التأمل؟",
    statusAudio: "المرحلة 2/3: تناغم الصوت الإلهي...",
    introTitle: "مرحباً بك في ذكر موشن",
    introSubtitle: "رحلة سينمائية في عالم الخطوط المقدسة",
    enterApp: "دخول المحراب",
    liveStatus: "متصل",
    recordingStatus: "تسجيل الروح",
    contactTitle: "تواصل معنا",
    contactDesc: "شاركنا رحلتك الروحية أو تعاون معنا.",
    contactEmail: "راسلنا",
    contactSocial: "تابعنا",
    outroTitle: "السلام عليكم",
    outroDesc: "جعل الله رحلتك مليئة بالنور.",
    billingInfo: "دليل إعداد الفوترة",
    billingLink: "https://ai.google.dev/gemini-api/docs/billing",
    billingRequirement: "يلزم وجود مشروع Google Cloud مع حساب فوترة نشط لتوليد الفيديو.",
    premiumMode: "الوضع المتقدم مفعل",
    freeTier: "الوضع المجاني (محدود)",
    howToUseCredits: "كيف تستفيد من مزايا المطورين الخاصة بك؟",
    step1: "1. قم بتفعيل رصيد الـ 500 دولار ورصيد الـ 50 دولار للذكاء الاصطناعي في صفحة المزايا.",
    step2: "2. أنشئ مفتاح API في AI Studio مرتبطاً بمشروع 'studio-...' الخاص بك.",
    step3: "3. اختر ذلك المفتاح هنا لفتح Veo 3.1 و Imagen 4.0 وتوليد 4K.",
    spiritualInsights: "رؤى روحية",
    searchingInsights: "البحث عن المعاني العميقة...",
    clearHistory: "مسح السجل بالكامل",
    confirmClear: "هل أنت متأكد من مسح السجل بالكامل؟ لا يمكن التراجع عن هذا الإجراء.",
    systemHealth: "حالة النظام",
    allSystemsGo: "جميع الأنظمة تعمل بكفاءة",
    resetApp: "إعادة ضبط التطبيق",
  }
};

const staticFilesUrl = 'https://www.gstatic.com/aistudio/starter-apps/type-motion/';

export const EXAMPLES: Video[] = [
  {
    id: '1',
    title: "Celestial Remembrance",
    videoUrl: staticFilesUrl + 'clouds_v2.mp4',
    description: "Sacred text floating gracefully amidst golden-hour clouds.",
  },
  {
    id: '2',
    title: "Light of Guidance",
    videoUrl: staticFilesUrl + 'fire_v2.mp4',
    description: "Ethereal light patterns revealing spiritual wisdom.",
  },
  {
    id: '3',
    title: "Morning Mist",
    videoUrl: staticFilesUrl + 'smoke_v2.mp4',
    description: "Serene atmospheric reveal of a peaceful reminder.",
  },
  {
    id: '4',
    title: "Deep Reflection",
    videoUrl: staticFilesUrl + 'water_v2.mp4',
    description: "The name of the Creator appearing through pure crystalline water.",
  },
];

const QUICK_ZEKR = [
  "سبحان الله",
  "الحمد لله",
  "لا إله إلا الله",
  "الله أكبر",
  "استغفر الله",
  "لاحول ولاقوة إلا بالله"
];

const ApiKeyDialog: React.FC<{ isOpen: boolean; onClose: () => void; onSelect: () => void; t: any; lang: string }> = ({ isOpen, onClose, onSelect, t, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-[2.5rem] shadow-[0_0_100px_rgba(16,185,129,0.1)] overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-500">
        <div className="relative p-8 md:p-12">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Key size={120} className="text-emerald-500" />
          </div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/20">
              <Key className="text-white" size={32} />
            </div>
            
            <h2 className={`text-3xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight ${lang === 'ar' ? 'font-arabic' : ''}`}>
              {t.apiKeyTitle}
            </h2>
            
            <p className={`text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed mb-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>
              {t.apiKeyDesc}
            </p>

            <div className="space-y-4 mb-10">
              <div className="p-5 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Sparkles size={16} />
                  <p className={`text-sm font-bold ${lang === 'ar' ? 'font-arabic' : ''}`}>{t.howToUseCredits}</p>
                </div>
                <ul className={`space-y-1 list-none p-0 m-0 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                  <li className="text-[11px] text-emerald-800/70 dark:text-emerald-400/70">{t.step1}</li>
                  <li className="text-[11px] text-emerald-800/70 dark:text-emerald-400/70">{t.step2}</li>
                  <li className="text-[11px] text-emerald-800/70 dark:text-emerald-400/70">{t.step3}</li>
                </ul>
              </div>

              <div className="flex items-start gap-4 p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <div className="mt-1 w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                <p className={`text-sm text-zinc-600 dark:text-zinc-300 font-medium ${lang === 'ar' ? 'font-arabic' : ''}`}>
                  {t.billingRequirement}
                </p>
              </div>
              
              <div className="flex items-start gap-4 p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <div className="mt-1 w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
                <p className={`text-sm text-zinc-600 dark:text-zinc-300 font-medium ${lang === 'ar' ? 'font-arabic' : ''}`}>
                  {t.apiKeyFreeNote}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onSelect}
                className={`flex-[2] py-5 px-8 bg-emerald-600 text-white rounded-[1.5rem] text-lg font-black shadow-2xl shadow-emerald-500/20 hover:bg-emerald-500 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3 ${lang === 'ar' ? 'font-arabic' : ''}`}
              >
                <Sparkles size={20} /> {t.selectKey}
              </button>
              
              <a 
                href={t.billingLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 py-5 px-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-[1.5rem] text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 ${lang === 'ar' ? 'font-arabic' : ''}`}
              >
                <BookOpen size={18} /> {t.billingInfo}
              </a>
            </div>
            
            <button 
              onClick={onClose}
              className={`w-full mt-6 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors uppercase tracking-widest ${lang === 'ar' ? 'font-arabic' : ''}`}
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroCarousel: React.FC<{ forceMute: boolean; history: ZekrHistory[]; onSelect: (item: ZekrHistory) => void; t: any; lang: string }> = ({ forceMute, history, onSelect, t, lang }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const video = EXAMPLES[currentIndex];

  useEffect(() => {
    if (forceMute) {
      setIsMuted(true);
    }
  }, [forceMute]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % EXAMPLES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + EXAMPLES.length) % EXAMPLES.length);
  }, []);

  return (
    <div className="absolute inset-0 bg-black group flex flex-col">
      <div className="relative flex-1">
        <video
          key={video.id}
          src={video.videoUrl}
          className="w-full h-full object-cover"
          autoPlay
          muted={isMuted}
          playsInline
          onEnded={handleNext}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 p-8 w-full text-white pointer-events-none">
          <div className="animate-in slide-in-from-bottom-2 fade-in duration-700">
            <h3 className="text-xl md:text-2xl font-bold mb-1">{video.title}</h3>
            <p className="text-xs md:text-sm text-zinc-300 opacity-80">{video.description}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all z-20"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <div className="absolute inset-y-0 left-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handlePrev} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all">
            <ChevronLeft size={24} />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center px-4 opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={handleNext} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div className="h-48 bg-zinc-900/50 backdrop-blur-xl border-t border-white/10 p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <History size={14} className="text-emerald-500" /> {t.personalGallery}
            </h4>
          </div>
          <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
            {history.map((item) => (
              <button 
                key={item.id} 
                onClick={() => onSelect(item)}
                className="flex-shrink-0 w-32 aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-emerald-500 transition-all relative group/item"
              >
                <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.text} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                  <Play size={16} className="text-white fill-current" />
                </div>
                <div className="absolute bottom-0 left-0 w-full p-1 bg-black/60 backdrop-blur-sm">
                  <p className="text-[8px] text-white truncate px-1">{item.text}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [viewMode, setViewMode] = useState<'gallery' | 'create'>('gallery');
  const [showKeyDialog, setShowKeyDialog] = useState(false);

  const [inputText, setInputText] = useState<string>("");
  const [inputStyle, setInputStyle] = useState<string>("");
  const [typographyPrompt, setTypographyPrompt] = useState<string>("");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [useAudio, setUseAudio] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [showStatus, setShowStatus] = useState<boolean>(false);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [spiritualInsights, setSpiritualInsights] = useState<string>("");
  const [isGifGenerating, setIsGifGenerating] = useState<boolean>(false);
  const [isSuggestingStyle, setIsSuggestingStyle] = useState<boolean>(false);
  const [history, setHistory] = useState<ZekrHistory[]>([]);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = translations[lang];

  useEffect(() => {
    const loadHistory = async () => {
      const items = await db.history.orderBy('timestamp').reverse().toArray();
      setHistory(items);
    };
    loadHistory();
  }, [viewMode]);

  useEffect(() => {
    if (state === AppState.GENERATING_IMAGE || state === AppState.GENERATING_VIDEO || state === AppState.PLAYING) {
      setViewMode('create');
    }
  }, [state]);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const isKeySelected = await window.aistudio.hasSelectedApiKey();
        setIsPremium(!!isKeySelected);
        if (!isKeySelected && state === AppState.IDLE && viewMode === 'gallery') {
          setShowKeyDialog(true);
        }
      }
    };
    checkKey();
    const interval = setInterval(checkKey, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectKey = async () => {
    setShowKeyDialog(false);
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      if (state === AppState.IDLE && viewMode === 'gallery') {
         setViewMode('create');
      }
    }
  };

  const handleMainCta = async () => {
    const isKeySelected = await window.aistudio?.hasSelectedApiKey();
    if (!isKeySelected) {
      setShowKeyDialog(true);
    } else {
      setViewMode('create');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const startProcess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const keySelected = await window.aistudio?.hasSelectedApiKey();
    if (!keySelected) {
      setShowKeyDialog(true);
      return;
    }

    setState(AppState.GENERATING_IMAGE);
    setIsGifGenerating(false);
    if (videoSrc && videoSrc.startsWith('blob:')) URL.revokeObjectURL(videoSrc);
    if (audioSrc && audioSrc.startsWith('blob:')) URL.revokeObjectURL(audioSrc);
    setVideoSrc(null);
    setImageSrc(null);
    setAudioSrc(null);
    
    const styleToUse = inputStyle.trim() || getRandomStyle();
    setStatusMessage(t.statusVisualizing);
    setSpiritualInsights("");

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        setShowKeyDialog(true);
        setState(AppState.IDLE);
        return;
      }

      // 1. Get Spiritual Insights in parallel using Google Search
      const ai = new GoogleGenAI({ apiKey });
      ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Provide a very brief (1-2 sentences) spiritual insight or tafsir for this text: "${inputText}". Output ONLY the insight.`,
        config: { tools: [{ googleSearch: {} }] }
      }).then(res => setSpiritualInsights(res.text || "")).catch(() => {});

      // 2. Generate Image
      const { data: b64Image, mimeType } = await generateTextImage({
        text: inputText, 
        style: styleToUse,
        typographyPrompt: typographyPrompt,
        referenceImage: referenceImage || undefined
      });

      setImageSrc(`data:${mimeType};base64,${b64Image}`);
      
      // 2. Generate Audio (Parallel if enabled)
      let audioUrl: string | null = null;
      if (useAudio) {
        setStatusMessage(t.statusAudio);
        audioUrl = await generateTTS(inputText);
        setAudioSrc(audioUrl);
      }

      // 3. Generate Video
      setState(AppState.GENERATING_VIDEO);
      setStatusMessage(t.statusAnimating);
      
      const videoUrl = await generateTextVideo(inputText, b64Image, mimeType, styleToUse, aspectRatio);
      setVideoSrc(videoUrl);
      
      // 4. Save to DB
      await db.history.add({
        text: inputText,
        style: styleToUse,
        videoUrl: videoUrl,
        imageUrl: `data:${mimeType};base64,${b64Image}`,
        timestamp: Date.now(),
        aspectRatio: aspectRatio,
        spiritualInsights: spiritualInsights
      });

      setState(AppState.PLAYING);
      setStatusMessage(t.statusPeace);

    } catch (err: any) {
      console.error(err);
      const msg = err.message || "";
      if (msg.includes("Requested entity was not found") || msg.includes("404")) {
        setShowKeyDialog(true);
        setState(AppState.IDLE);
      } else if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
        setStatusMessage(t.quotaExceeded);
        setState(AppState.ERROR);
      } else {
        setStatusMessage(msg || t.issueOccurred);
        setState(AppState.ERROR);
      }
    }
  };

  const reset = () => {
    setState(AppState.IDLE);
    setVideoSrc(null);
    setImageSrc(null);
    setIsGifGenerating(false);
  };

  const handleClearHistory = async () => {
    if (window.confirm(t.confirmClear)) {
      await db.history.clear();
      setHistory([]);
    }
  };

  const handleResetApp = () => {
    if (window.confirm(lang === 'ar' ? 'هل تريد إعادة ضبط التطبيق بالكامل؟ سيتم مسح كل شيء.' : 'Reset everything? This will wipe all local data.')) {
      db.history.clear();
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleDownload = () => {
    if (videoSrc) {
      const a = document.createElement('a');
      a.href = videoSrc;
      a.download = `zekr-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDownloadGif = async () => {
    if (!videoSrc) return;
    setIsGifGenerating(true);
    try {
      const gifBlob = await createGifFromVideo(videoSrc);
      const gifUrl = URL.createObjectURL(gifBlob);
      const a = document.createElement('a');
      a.href = gifUrl;
      a.download = `zekr-${Date.now()}.gif`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(gifUrl);
    } catch (error) {
      alert("GIF generation failed.");
    } finally {
      setIsGifGenerating(false);
    }
  };

  const renderAppContent = () => {
    if (state === AppState.ERROR) {
       return (
        <div className="flex flex-col items-center justify-center space-y-8 h-full p-8 text-center animate-in zoom-in-95">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertTriangle size={40} />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">{t.issueOccurred}</h3>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">{statusMessage}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
            <button 
              onClick={() => startProcess()} 
              className="w-full px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2 group"
            >
              <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
              {t.tryAgain}
            </button>
            <button 
              onClick={reset} 
              className="w-full px-8 py-4 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
            >
              <Edit2 size={18} />
              {t.editInput}
            </button>
          </div>
        </div>
      );
    }

    if (state === AppState.GENERATING_IMAGE || state === AppState.GENERATING_VIDEO || state === AppState.PLAYING) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8 bg-zinc-50 dark:bg-zinc-950">
          <div className={`flex items-center gap-3 px-5 py-2 rounded-full mb-6 transition-all duration-500 ${state === AppState.PLAYING ? 'opacity-0 h-0 mb-0 overflow-hidden' : 'bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800'}`}>
             <Loader2 size={16} className="animate-spin text-emerald-500" />
             <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300 uppercase tracking-widest">{statusMessage}</span>
          </div>
          <div className="relative w-full max-w-5xl aspect-video bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-zinc-900/5 dark:ring-white/10">
            {(state === AppState.GENERATING_IMAGE) && !imageSrc && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6">
                 <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                 <div className="max-w-md space-y-4">
                    <p className="text-zinc-400 text-sm font-medium animate-pulse">{t.manifestingStillness}</p>
                    {spiritualInsights && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
                      >
                        <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-2 flex items-center justify-center gap-2">
                          <Sparkles size={12} /> {t.spiritualInsights}
                        </p>
                        <p className={`text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 italic ${lang === 'ar' ? 'font-arabic' : ''}`}>
                          "{spiritualInsights}"
                        </p>
                      </motion.div>
                    )}
                 </div>
              </div>
            )}
            {imageSrc && !videoSrc && <img src={imageSrc} alt="Sacred Still" className="w-full h-full object-cover animate-in fade-in duration-1000" />}
            {imageSrc && state === AppState.GENERATING_VIDEO && (
               <div className="absolute inset-0 bg-white/20 dark:bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center z-10 transition-all p-8 text-center">
                  <div className="bg-white/80 dark:bg-zinc-800/80 p-4 rounded-full shadow-2xl mb-6">
                     <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  </div>
                  {spiritualInsights && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="max-w-md p-6 bg-white/90 dark:bg-zinc-900/90 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-md"
                    >
                      <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-2 flex items-center justify-center gap-2">
                        <Sparkles size={12} /> {t.spiritualInsights}
                      </p>
                      <p className={`text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 italic ${lang === 'ar' ? 'font-arabic' : ''}`}>
                        "{spiritualInsights}"
                      </p>
                    </motion.div>
                  )}
               </div>
             )}
            {videoSrc && (
              <div className="w-full h-full relative">
                <video src={videoSrc} autoPlay loop playsInline controls className="w-full h-full object-cover animate-in fade-in duration-1000" />
                {audioSrc && <audio src={audioSrc} autoPlay loop className="hidden" />}
                
                {state === AppState.PLAYING && (
                  <div className="absolute top-6 right-6 flex flex-col gap-3 z-20">
                    <button 
                      onClick={handleDownload}
                      className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-emerald-500 transition-all shadow-xl group"
                      title={t.saveVideo}
                    >
                      <Download size={20} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert(lang === 'ar' ? 'تم نسخ الرابط' : 'Link copied to clipboard');
                      }}
                      className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white hover:bg-emerald-500 transition-all shadow-xl group"
                      title="Copy Link"
                    >
                      <Languages size={20} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                )}

                {state === AppState.PLAYING && spiritualInsights && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute bottom-20 left-6 right-6 md:right-auto md:max-w-md p-6 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl text-white z-20 shadow-2xl"
                  >
                    <div className="flex items-center gap-2 mb-2">
                       <Sparkles size={14} className="text-emerald-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{t.spiritualInsights}</span>
                    </div>
                    <p className={`text-sm leading-relaxed italic ${lang === 'ar' ? 'font-arabic' : ''}`}>
                      "{spiritualInsights}"
                    </p>
                  </motion.div>
                )}
              </div>
            )}
          </div>
          {state === AppState.PLAYING && (
            <div className={`w-full max-w-5xl mt-8 flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-4`}>
              <button onClick={reset} className="flex items-center gap-2 px-6 py-3 text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 transition-all font-bold text-sm">
                <ArrowLeft size={18} className={lang === 'ar' ? 'rotate-180' : ''} /> {t.newMeditation}
              </button>
              <div className="flex items-center gap-3">
               <button onClick={handleDownloadGif} disabled={isGifGenerating} className="px-5 py-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-bold rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm">
                {isGifGenerating ? <Loader2 size={16} className="animate-spin" /> : <FileType size={16} />} {t.saveGif}
              </button>
               <button onClick={handleDownload} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-xl shadow-emerald-900/20 text-sm">
                <Download size={16} /> {t.saveVideo}
              </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10 bg-white dark:bg-zinc-950">
        <div className="mb-8">
          <h2 className={`text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 ${lang === 'ar' ? 'font-arabic' : ''}`}>
            {t.createHeader} <Sparkles className="text-emerald-500" size={20} />
          </h2>
          <p className={`text-zinc-500 mt-2 ${lang === 'ar' ? 'font-arabic text-sm' : ''}`}>{t.createDesc}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={startProcess} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <BookOpen size={14} className="text-emerald-500" /> {t.labelSacredText}
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={inputText} 
                    onChange={(e) => setInputText(e.target.value)} 
                    placeholder={t.placeholderText}
                    maxLength={60} 
                    className={`w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl px-5 py-4 text-xl font-medium focus:outline-none focus:border-emerald-500 transition-all text-zinc-900 dark:text-white ${lang === 'ar' ? 'font-arabic' : ''}`} 
                    required 
                  />
                  <div className={`absolute ${lang === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 flex gap-2`}>
                     <button type="button" onClick={() => setInputText(QUICK_ZEKR[Math.floor(Math.random() * QUICK_ZEKR.length)])} className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-500 transition-colors" title={t.surpriseMe}>
                        <Wand2 size={18} />
                     </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {QUICK_ZEKR.map((zekr) => (
                    <button 
                      key={zekr} 
                      type="button" 
                      onClick={() => setInputText(zekr)}
                      className={`px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium text-zinc-500 dark:text-zinc-400 rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:text-emerald-600 transition-all ${lang === 'ar' ? 'font-arabic' : ''}`}
                    >
                      {zekr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Paintbrush size={14} className="text-emerald-500" /> {t.labelEnvironment}
                  </label>
                  <button 
                    type="button" 
                    onClick={async () => {
                      setIsSuggestingStyle(true);
                      const suggestion = await generateStyleSuggestion(inputText);
                      if (suggestion) setInputStyle(suggestion);
                      setIsSuggestingStyle(false);
                    }} 
                    disabled={!inputText.trim() || isSuggestingStyle} 
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline disabled:opacity-50"
                  >
                    {isSuggestingStyle ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} {t.suggestStyle}
                  </button>
                </div>
                <textarea 
                  value={inputStyle} 
                  onChange={(e) => setInputStyle(e.target.value)} 
                  placeholder={t.placeholderStyle}
                  className={`w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:outline-none focus:border-emerald-500 transition-all text-zinc-900 dark:text-white resize-none h-28 ${lang === 'ar' ? 'font-arabic' : ''}`} 
                />
              </div>

              <button 
                type="submit" 
                disabled={!inputText.trim()} 
                className={`w-full py-5 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-2xl shadow-emerald-900/20 active:scale-[0.98] flex items-center justify-center gap-3 text-lg uppercase tracking-widest ${lang === 'ar' ? 'font-arabic' : ''}`}
              >
                <Play size={20} className={`fill-current ${lang === 'ar' ? 'rotate-180' : ''}`} /> {t.createMasterpiece}
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Type size={14} className="text-emerald-500" /> {t.labelTypography}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {TYPOGRAPHY_SUGGESTIONS.slice(0, 6).map((opt) => (
                  <button 
                    key={opt.id} 
                    onClick={() => setTypographyPrompt(opt.prompt)} 
                    className={`p-3 text-left border-2 rounded-xl transition-all ${typographyPrompt === opt.prompt ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-zinc-100 dark:border-zinc-800 hover:border-emerald-200'}`}
                  >
                    <p className={`text-xs font-bold text-zinc-900 dark:text-white ${lang === 'ar' ? 'font-arabic' : ''}`}>{opt.label}</p>
                    <p className="text-[10px] text-zinc-500 mt-1 truncate">{opt.prompt}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <ImageIcon size={14} className="text-emerald-500" /> {t.labelReferenceImage}
              </label>
              <div className="flex gap-4">
                 <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()} 
                  className="flex-1 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl h-24 flex flex-col items-center justify-center gap-2 text-zinc-400 hover:border-emerald-500 hover:text-emerald-500 transition-all group"
                 >
                    <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
                    <span className={`text-xs font-bold ${lang === 'ar' ? 'font-arabic' : ''}`}>{t.uploadStyle}</span>
                  </button>
                  <input type="file" ref={fileInputRef} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) setReferenceImage(await fileToBase64(file));
                  }} accept="image/*" className="sr-only" />
                  
                  {referenceImage && (
                    <div className="h-24 w-24 relative rounded-2xl overflow-hidden border-2 border-emerald-500 animate-in zoom-in">
                       <img src={referenceImage} alt="Ref" className="w-full h-full object-cover" />
                       <button onClick={() => setReferenceImage(null)} className="absolute top-1 right-1 bg-white dark:bg-zinc-800 p-1 rounded-full shadow-lg">
                        <X size={12} />
                       </button>
                    </div>
                  )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Monitor size={14} className="text-emerald-500" /> {t.labelAspectRatio}
                </label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setAspectRatio('16:9')}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${aspectRatio === '16:9' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600' : 'border-zinc-100 dark:border-zinc-800 text-zinc-400'}`}
                  >
                    <Monitor size={16} />
                    <span className="text-[10px] font-bold">16:9</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAspectRatio('9:16')}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${aspectRatio === '9:16' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600' : 'border-zinc-100 dark:border-zinc-800 text-zinc-400'}`}
                  >
                    <Smartphone size={16} />
                    <span className="text-[10px] font-bold">9:16</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Volume2 size={14} className="text-emerald-500" /> {t.labelAudio}
                </label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setUseAudio(false)}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${!useAudio ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600' : 'border-zinc-100 dark:border-zinc-800 text-zinc-400'}`}
                  >
                    <VolumeX size={16} />
                    <span className="text-[10px] font-bold">{t.audioNone}</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setUseAudio(true)}
                    className={`flex-1 py-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${useAudio ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600' : 'border-zinc-100 dark:border-zinc-800 text-zinc-400'}`}
                  >
                    <Volume2 size={16} />
                    <span className="text-[10px] font-bold">{t.audioTTS}</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
              <p className={`text-[10px] text-emerald-800 dark:text-emerald-400 leading-relaxed font-medium ${lang === 'ar' ? 'font-arabic' : ''}`}>
                {t.tip}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const isFlip = viewMode === 'create';

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`min-h-screen w-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-500 overflow-x-hidden selection:bg-emerald-600 selection:text-white ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}>
      <ApiKeyDialog isOpen={showKeyDialog} onClose={() => setShowKeyDialog(false)} onSelect={handleSelectKey} t={t} lang={lang} />
      <SystemStatus isOpen={showStatus} onClose={() => setShowStatus(false)} lang={lang} t={t} />
      
      {/* Top Bar with Language Toggle and GitHub Link */}
      <div className={`absolute top-6 ${lang === 'ar' ? 'left-6 right-6 flex-row-reverse' : 'left-6 right-6'} z-[60] flex justify-between items-center pointer-events-none`}>
        <div className="flex items-center gap-4 pointer-events-auto">
          <button 
            onClick={() => setShowStatus(true)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${isPremium ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-zinc-500/10 border-zinc-500/20'}`}
          >
            <div className={`w-2 h-2 rounded-full animate-pulse ${isPremium ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isPremium ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500'}`}>
              {isPremium ? t.premiumMode : t.freeTier}
            </span>
          </button>
          {state === AppState.GENERATING_VIDEO && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
                {t.recordingStatus}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 pointer-events-auto">
          <a 
            href="https://github.com/ZOOKA-AI/quran.zekr.by.zooka-ai.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-zinc-900/30 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-white/20 dark:hover:bg-zinc-800/50 transition-all shadow-xl group"
            title={t.githubRepo}
          >
            <Github size={14} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">{t.githubRepo}</span>
          </a>
          <button 
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 dark:bg-zinc-900/30 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-full text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:bg-white/20 dark:hover:bg-emerald-500/10 transition-all shadow-xl"
          >
            <Languages size={14} />
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 lg:p-6 overflow-hidden">
        <div className={`transition-all duration-1000 ease-[cubic-bezier(0.25,0.8,0.25,1)] w-full flex flex-col lg:flex-row items-center justify-center ${isFlip ? 'max-w-6xl' : 'max-w-7xl gap-8 lg:gap-16'}`}>
          
          {/* Landing Side Content */}
          <div className={`flex flex-col justify-center space-y-6 z-10 text-center ${lang === 'ar' ? 'lg:text-right' : 'lg:text-left'} transition-all duration-1000 ease-[cubic-bezier(0.25,0.8,0.25,1)] flex-shrink-0 ${isFlip ? 'max-h-0 opacity-0 lg:w-0' : 'max-h-[1000px] opacity-100 lg:w-5/12'}`}>
             <div className="min-w-[300px] lg:w-[500px]">
                <div className="space-y-6">
                  <div className={`font-black text-2xl tracking-tighter text-emerald-600 dark:text-emerald-400 flex items-center justify-center ${lang === 'ar' ? 'lg:justify-start flex-row' : 'lg:justify-start'} gap-3`}>
                      <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
                        <Moon className="text-white fill-current" size={20} />
                      </div>
                      <span className={lang === 'ar' ? 'font-arabic' : ''}>{t.brandName}</span>
                  </div>
                  <h1 className={`text-5xl lg:text-7xl font-black text-zinc-900 dark:text-white tracking-tight leading-[0.95] ${lang === 'ar' ? 'font-arabic leading-tight' : ''}`}>
                    {t.heroTitle1} <br/> <span className="text-emerald-600 dark:text-emerald-500 italic">{t.heroTitle2}</span>
                  </h1>
                  <p className={`text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md mx-auto lg:mx-0 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                    {t.heroSubtitle}
                  </p>
               </div>
               <div className={`pt-10 flex flex-col items-center ${lang === 'ar' ? 'lg:items-start' : 'lg:items-start'} gap-4`}>
                  <button onClick={handleMainCta} className={`group px-10 py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xl font-black rounded-3xl hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-4 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                    <VideoIcon size={24} className="group-hover:rotate-12 transition-transform" /> {t.createBtn}
                  </button>
                  <p className={`text-xs text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2 ${lang === 'ar' ? 'font-arabic' : ''}`}>
                    <Heart size={14} className="text-emerald-500" /> {t.inspiredBy}
                  </p>
               </div>
             </div>
          </div>

          {/* Card Side */}
          <div className={`relative z-20 [perspective:2000px] transition-all duration-1000 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${isFlip ? 'w-full h-[85vh]' : 'w-full lg:w-7/12 h-[550px] lg:h-[650px]'}`}>
             <div className={`relative w-full h-full transition-all duration-1000 [transform-style:preserve-3d] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_40px_100px_-15px_rgba(0,0,0,0.6)] rounded-[3rem] ${isFlip ? '[transform:rotateY(180deg)]' : ''}`}>
                
                {/* Front (Gallery/Hero) */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-black rounded-[3rem] overflow-hidden border border-zinc-800">
                   <HeroCarousel 
                    forceMute={isFlip} 
                    history={history} 
                    onSelect={(item) => {
                      setVideoSrc(item.videoUrl);
                      setImageSrc(item.imageUrl);
                      setInputText(item.text);
                      setAspectRatio(item.aspectRatio);
                      setState(AppState.PLAYING);
                    }}
                    t={t}
                    lang={lang}
                   />
                </div>
                
                {/* Back (Creator) */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white dark:bg-zinc-950 rounded-[3rem] overflow-hidden border-2 border-zinc-100 dark:border-zinc-800">
                   <button onClick={() => setViewMode('gallery')} className={`absolute top-6 ${lang === 'ar' ? 'left-6' : 'right-6'} z-50 p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 rounded-full transition-colors`} title={t.backToGallery}><X size={24} /></button>
                   {renderAppContent()}
                </div>
             </div>
          </div>
        </div>
      </div>
      <footer className="w-full py-12 text-center z-10 flex flex-col gap-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-8 md:p-12 shadow-2xl">
            <h2 className={`text-3xl font-black mb-4 ${lang === 'ar' ? 'font-arabic' : ''}`}>{t.contactTitle}</h2>
            <p className={`text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto ${lang === 'ar' ? 'font-arabic' : ''}`}>{t.contactDesc}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://g.dev/zooka-ai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20">
                <Sparkles size={18} /> {lang === 'ar' ? 'ملف المطور' : 'Developer Profile'}
              </a>
              <button 
                onClick={handleResetApp}
                className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-2xl font-bold hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all"
              >
                <Trash2 size={18} /> {t.resetApp}
              </button>
            </div>
            
            <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">
                  <Activity size={14} /> {t.systemHealth}: {t.allSystemsGo}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-full text-xs font-bold">
                  v2.5.0-stable
                </div>
              </div>
              <p className="text-zinc-400 text-xs font-medium">
                © 2026 ZekrMotion AI • {lang === 'ar' ? 'صنع بكل حب للذكر' : 'Crafted with love for Zekr'}
              </p>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showIntro && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950 flex items-center justify-center p-6"
          >
            <div className="text-center space-y-8 max-w-2xl">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="w-24 h-24 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-emerald-500/20 mx-auto"
              >
                <Moon className="text-white fill-current" size={48} />
              </motion.div>
              <div className="space-y-4">
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className={`text-5xl md:text-7xl font-black text-white tracking-tighter ${lang === 'ar' ? 'font-arabic' : ''}`}
                >
                  {t.introTitle}
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className={`text-xl text-zinc-400 ${lang === 'ar' ? 'font-arabic' : ''}`}
                >
                  {t.introSubtitle}
                </motion.p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setShowIntro(false)}
                  className={`px-12 py-5 bg-emerald-600 text-white text-xl font-black rounded-3xl hover:bg-emerald-500 transition-all shadow-2xl active:scale-95 flex items-center gap-3 ${lang === 'ar' ? 'font-arabic' : ''}`}
                >
                  <Play size={24} fill="currentColor" />
                  {t.enterApp}
                </button>
                <a 
                  href="https://g.dev/zooka-ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`px-8 py-5 bg-white/5 text-white text-lg font-bold rounded-3xl border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3 group ${lang === 'ar' ? 'font-arabic' : ''}`}
                >
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-widest opacity-60">Verified Developer</p>
                    <p>{lang === 'ar' ? 'ملف المطور' : 'Developer Profile'}</p>
                  </div>
                </a>
              </div>
            </div>
            
            {/* Background Atmosphere */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px] animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-900/20 rounded-full blur-[120px] animate-pulse delay-700" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
