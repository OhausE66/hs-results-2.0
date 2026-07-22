import React, { useState, useEffect } from 'react';
import { Building, ArrowRight, Save, FolderOpen, Loader2, CheckCircle, Database } from 'lucide-react';
import { OrgContextData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { saveSharedOrgContext, getSharedOrgContexts } from '../services/firebase';

interface OrgContextFormProps {
  user: any;
  onComplete: (data: OrgContextData) => void;
  initialData?: Partial<OrgContextData>;
}

export const OrgContextForm: React.FC<OrgContextFormProps> = ({ user, onComplete, initialData }) => {
  const { language, t } = useLanguage();
  const [data, setData] = useState<OrgContextData>({
    templateName: initialData?.templateName || '',
    size: initialData?.size || (language === 'de' ? 'Mittelstand (50-250 MA)' : 'Mid-sized (50-250 employees)'),
    establishedSince: initialData?.establishedSince || '',
    industry: initialData?.industry || '',
    innovationLevel: initialData?.innovationLevel || 5,
    mainProblem: initialData?.mainProblem || '',
    profitability: initialData?.profitability || 5
  });

  const [templates, setTemplates] = useState<OrgContextData[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user]);

  const loadTemplates = async () => {
    if (!user) return;
    setLoadingTemplates(true);
    try {
      const res = await getSharedOrgContexts(user.uid);
      setTemplates(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!user || !data.templateName) return;
    setSavingTemplate(true);
    try {
      await saveSharedOrgContext(user.uid, data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      loadTemplates();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingTemplate(false);
    }
  };

  const selectTemplate = (tpl: OrgContextData) => {
    setData({ ...tpl });
    setShowTemplates(false);
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-hs-blue text-white rounded-2xl shadow-lg">
              <Building size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-hs-blue uppercase tracking-tight leading-none">{t('cult.setup.title')}</h1>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">{t('cult.setup.sub')}</p>
            </div>
          </div>

          {user && (
            <button 
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center space-x-2 text-xs font-black uppercase text-hs-accent hover:text-hs-orange transition-colors bg-slate-50 px-5 py-3 rounded-full border border-slate-100 shadow-sm"
            >
              <FolderOpen size={16} />
              <span>{language === 'de' ? 'Profil laden' : 'Load Profile'}</span>
            </button>
          )}
        </div>

        {showTemplates && (
          <div className="mb-10 bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed border-hs-accent/30 animate-fade-in">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-hs-accent mb-4 flex items-center">
              <Database size={12} className="mr-2" /> Gespeicherte Profile
            </h4>
            {loadingTemplates ? (
              <Loader2 className="animate-spin mx-auto text-hs-accent" />
            ) : templates.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-4 italic">Noch keine Profile gespeichert.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.map((tpl, i) => (
                  <button 
                    key={i} 
                    onClick={() => selectTemplate(tpl)}
                    className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-hs-orange transition-all text-left group shadow-sm"
                  >
                    <p className="font-black text-hs-blue text-sm uppercase truncate">{tpl.templateName}</p>
                    <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">{tpl.industry} • {tpl.size}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Profil-Name (z.B. IT-Abteilung)</label>
              <input type="text" value={data.templateName} onChange={(e) => setData({...data, templateName: e.target.value})} placeholder="Interne Vorlage..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-hs-blue transition-all shadow-inner" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('cult.setup.size')}</label>
              <select value={data.size} onChange={(e) => setData({...data, size: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-hs-blue transition-all shadow-inner">
                <option>Startup (1-10 MA)</option>
                <option>Kleinunternehmen (11-50 MA)</option>
                <option>Mittelstand (50-250 MA)</option>
                <option>Großunternehmen (250-1000 MA)</option>
                <option>Konzern (1000+ MA)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{language === 'de' ? 'Branche' : 'Industry'}</label>
              <input type="text" placeholder="z.B. Automotive" value={data.industry} onChange={(e) => setData({...data, industry: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-hs-blue transition-all shadow-inner" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('cult.setup.since')}</label>
              <input type="text" placeholder="z.B. 1998" value={data.establishedSince} onChange={(e) => setData({...data, establishedSince: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-hs-blue transition-all shadow-inner" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'de' ? 'Innovationskraft' : 'Innovation Level'}</label>
                <span className="bg-hs-blue text-white px-3 py-1 rounded-full text-xs font-black">{data.innovationLevel} / 10</span>
              </div>
              <input type="range" min="1" max="10" value={data.innovationLevel} onChange={(e) => setData({...data, innovationLevel: parseInt(e.target.value)})} className="w-full accent-hs-orange" />
              <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase mt-2">
                <span>{language === 'de' ? 'Stagnation' : 'Stagnation'}</span>
                <span>{language === 'de' ? 'High-Tech' : 'High-Tech'}</span>
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'de' ? 'Wirtschaftlichkeit' : 'Profitability'}</label>
                <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-black">{data.profitability} / 10</span>
              </div>
              <input type="range" min="1" max="10" value={data.profitability} onChange={(e) => setData({...data, profitability: parseInt(e.target.value)})} className="w-full accent-hs-accent" />
              <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase mt-2">
                <span>{language === 'de' ? 'Krise' : 'Crisis'}</span>
                <span>{language === 'de' ? 'Exzellent' : 'Excellent'}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{language === 'de' ? 'Aktuell größte Herausforderung' : 'Main Challenge'}</label>
            <textarea placeholder="Was bremst Sie aktuell am meisten aus?" value={data.mainProblem} onChange={(e) => setData({...data, mainProblem: e.target.value})} className="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-hs-blue transition-all resize-none shadow-inner" />
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-6">
            {user && (
              <button 
                onClick={handleSaveAsTemplate}
                disabled={savingTemplate || !data.templateName}
                className={`flex-grow md:flex-grow-0 md:w-1/3 flex items-center justify-center space-x-2 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${saveSuccess ? 'bg-emerald-500 text-white shadow-xl' : 'bg-white border-2 border-hs-blue text-hs-blue hover:bg-hs-blue hover:text-white'}`}
              >
                {savingTemplate ? <Loader2 className="animate-spin" size={16} /> : saveSuccess ? <CheckCircle size={16} /> : <Save size={16} />}
                <span>{saveSuccess ? (language === 'de' ? 'Gespeichert' : 'Saved') : (language === 'de' ? 'Profil sichern' : 'Save Profile')}</span>
              </button>
            )}
            
            <button 
              onClick={() => onComplete(data)}
              className="flex-grow py-5 bg-hs-blue text-white rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-hs-orange transition-all shadow-xl hover:-translate-y-1 flex items-center justify-center group"
            >
              <span>{language === 'de' ? 'Analyse-Prozess starten' : 'Start Analysis Process'}</span>
              <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};