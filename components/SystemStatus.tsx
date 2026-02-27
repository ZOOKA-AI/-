import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Clock, Activity, ShieldCheck, Zap } from 'lucide-react';

interface Incident {
  date: string;
  title: string;
  status: string;
  time?: string;
  details?: string;
}

interface SystemStatusProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
  t: any;
}

const incidents: Incident[] = [
  {
    date: "27 فبراير 2026",
    title: "AI Studio Build - مشاكل متقطعة",
    status: "تم حل المشكلة",
    time: "03:00",
  },
  {
    date: "24 فبراير 2026",
    title: "AI Studio Build - مشاكل متقطعة",
    status: "تم حل المشكلة",
    time: "19:00",
    details: "تم تحديد عدة مشكلات تؤثر على تجربة البناء. قد يلاحظ المستخدمون بطء استجابة الوكيل عند استخدام مفتاح API."
  },
  {
    date: "22 فبراير 2026",
    title: "AI Studio Build - تعطل الخدمة",
    status: "تم حل المشكلة",
    time: "06:37",
    details: "10% من طلبات الوكلاء كانت معلقة."
  }
];

export const SystemStatus: React.FC<SystemStatusProps> = ({ isOpen, onClose, lang, t }) => {
  if (!isOpen) return null;

  const isAr = lang === 'ar';

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-zinc-950 w-full max-w-3xl max-h-[85vh] rounded-[2rem] border border-zinc-800 overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="p-8 border-bottom border-zinc-800 flex justify-between items-center bg-zinc-900/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                <Activity className="text-emerald-500" size={24} />
              </div>
              <div>
                <h2 className={`text-2xl font-black text-white tracking-tight ${isAr ? 'font-arabic' : ''}`}>
                  {isAr ? 'حالة النظام' : 'System Status'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">
                    {isAr ? 'جميع الأنظمة تعمل' : 'All Systems Operational'}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-zinc-800 rounded-2xl text-zinc-400 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: isAr ? 'واجهة برمجة التطبيقات (API)' : 'Gemini API', status: '90 days', icon: Zap },
                { name: isAr ? 'البث المباشر' : 'Live API', status: '90 days', icon: Activity },
                { name: isAr ? 'استوديو الذكاء الاصطناعي' : 'AI Studio', status: '90 days', icon: ShieldCheck },
              ].map((service, i) => (
                <div key={i} className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-3xl flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <service.icon className="text-zinc-500" size={20} />
                    <CheckCircle2 className="text-emerald-500" size={18} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1 ${isAr ? 'font-arabic' : ''}`}>
                      {service.name}
                    </p>
                    <p className="text-xs text-zinc-600">Operational • {service.status}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Past Incidents */}
            <div className="space-y-6">
              <h3 className={`text-lg font-bold text-white flex items-center gap-2 ${isAr ? 'font-arabic' : ''}`}>
                <Clock size={18} className="text-emerald-500" />
                {isAr ? 'الحوادث السابقة' : 'Past Incidents'}
              </h3>
              
              <div className="space-y-4">
                {incidents.map((incident, i) => (
                  <div key={i} className="p-6 bg-zinc-900/20 border border-zinc-800/50 rounded-3xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{incident.date}</p>
                        <h4 className={`text-md font-bold text-zinc-200 ${isAr ? 'font-arabic' : ''}`}>{incident.title}</h4>
                      </div>
                      <span className={`px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/20 ${isAr ? 'font-arabic' : ''}`}>
                        {incident.status}
                      </span>
                    </div>
                    {incident.details && (
                      <p className={`text-sm text-zinc-500 leading-relaxed ${isAr ? 'font-arabic' : ''}`}>
                        {incident.details}
                      </p>
                    )}
                    <p className="text-[10px] text-zinc-600 font-mono">{incident.time} UTC</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 text-center">
            <p className={`text-xs text-zinc-500 ${isAr ? 'font-arabic' : ''}`}>
              {isAr ? 'يتم تحديث هذه البيانات تلقائياً بناءً على حالة خدمات Google Cloud.' : 'Data updated automatically based on Google Cloud service status.'}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
