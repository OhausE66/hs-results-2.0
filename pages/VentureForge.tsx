import React, { useState, useEffect } from 'react';
import { generateVentureConcepts, generateVentureDeepDive, VentureConcept, VentureDeepDive } from '../services/geminiService';
import { ViewState, OrgContextData } from '../types';
import { 
  Loader2, ArrowRight, Sparkles, 
  ChevronLeft, Rocket, Zap, 
  Coins, TrendingUp, PlayCircle, Info, Globe, ChevronRight, CheckCircle, Lightbulb, Briefcase, Star, UserCheck, BarChart3, Cpu, Layers, AlertCircle, Target, ShieldAlert, ListChecks, ArrowLeft, Download, Printer, Save, MessageSquareText, Mail
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { AiWaiting } from '../components/AiWaiting';
import { Auth } from '../components/Auth';
import { saveProjectSession } from '../services/firebase';
import { OrgContextForm } from '../components/OrgContextForm';

type Step = 'LANDING' | 'ORG_CONTEXT' | 'CORP_SCAN' | 'PERSONAL_DNA' | 'RESULT' | 'DEEP_DIVE';

export const VentureForge: React.FC<{ user: any, setView: (v: ViewState) => void }> = ({ user, setView }) => {
  const { language, t } = useLanguage();
  const [step, setStep] = useState<Step>('LANDING');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const tr = (de: string, en: string) => (language === 'de' ? de : en);
  const [corpNeeds, setCorpNeeds] = useState('');
  const [orgInfo, setOrgInfo] = useState<OrgContextData | null>(null);

  // DNA State
  const [founderDNA, setFounderDNA] = useState({
    skills: '',
    industry_xp: '5',
    risk_appetite: 'High',
    passion_topics: ''
  });

  // Result State
  const [concepts, setConcepts] = useState<VentureConcept[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<VentureConcept | null>(null);
  const [deepDive, setDeepDive] = useState<VentureDeepDive | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const forgeConcepts = async () => {
    setLoading(true);
    setApiError(null);
    setStep('RESULT');
    try {
      const dna = { ...founderDNA, corpNeeds, orgInfo };
      const res = await generateVentureConcepts(dna, language);
      if (!res || res.length === 0) throw new Error('No concepts generated');
      setConcepts(res);
    } catch (e) {
      console.error(e);
      setConcepts([]);
      setApiError(tr('Die KI hat keine Konzepte geliefert. Bitte versuchen Sie es erneut.', 'The AI did not return any concepts. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeepDive = async (concept: VentureConcept) => {
    setLoading(true);
    setApiError(null);
    setDeepDive(null);
    setSelectedConcept(concept);
    setStep('DEEP_DIVE');
    try {
      const dna = { ...founderDNA, corpNeeds, orgInfo };
      const res = await generateVentureDeepDive(concept, dna, language);
      if (!res) throw new Error('Deep dive empty');
      setDeepDive(res);
    } catch (e) {
      console.error(e);
      setApiError(tr('Die Detailanalyse konnte nicht erstellt werden. Bitte versuchen Sie es erneut.', 'The detailed analysis could not be created. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const renderLanding = () => (
    <div className="max-w-6xl mx-auto py-12 animate-fade-in px-4">
       <div className="flex flex-col lg:flex-row items-start gap-16 mb-24">
          <div className="lg:w-1/2 space-y-8">
             <div className="flex items-center space-x-4 mb-2">
                <div className="h-[3px] w-16 bg-hs-orange"></div>
                <p className="text-hs-orange font-black uppercase tracking-[0.3em] text-sm">{t('vf.subtitle')}</p>
             </div>
             <h1 className="text-6xl font-black text-hs-blue uppercase tracking-tight leading-[0.95]">{t('vf.title')}</h1>
             <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                <p className="font-bold text-hs-blue text-xl">{t('vf.landing.main')}</p>
                <p>{t('vf.landing.text1')}</p>
                <div className="bg-hs-blue/5 p-8 rounded-[2.5rem] border-l-8 border-hs-accent shadow-sm">
                   <p className="text-hs-blue font-bold leading-relaxed">{t('vf.landing.highlight1')}</p>
                </div>
                <p>{t('vf.landing.highlight2')}</p>
             </div>
             <div className="pt-8">
                <button onClick={() => setStep('ORG_CONTEXT')} className="bg-hs-blue text-white px-10 py-5 rounded-full font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-xl hover:-translate-y-1 flex items-center group">
                  {t('vf.btn.start')} <ArrowRight size={20} className="ml-3 group-hover:translate-x-2 transition-transform" />
                </button>
             </div>
          </div>
          <div className="lg:w-1/2">
             <div className="relative group">
                <img src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=1200" className="rounded-[3rem] shadow-2xl z-10 relative group-hover:scale-[1.02] transition-transform duration-700" alt="Venture Design" />
                <div className="absolute -bottom-8 -right-8 w-full h-full border-4 border-hs-accent/30 rounded-[3rem] -z-10"></div>
                <div className="absolute -top-10 -left-10 bg-hs-blue p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center text-white border border-slate-100">
                   <Rocket size={48} className="mb-2 text-hs-orange" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Venture Forge</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderDNA = () => (
    <div className="max-w-4xl mx-auto py-12 animate-fade-in px-4">
       <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
         <h2 className="text-3xl font-black text-hs-blue uppercase mb-8 flex items-center"><UserCheck className="mr-3 text-hs-orange" /> {t('vf.dna.title')}</h2>
         <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('vf.dna.skills')}</label>
                  <textarea value={founderDNA.skills} onChange={e => setFounderDNA({...founderDNA, skills: e.target.value})} className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-hs-blue resize-none shadow-inner" placeholder="Was können Sie besonders gut?" />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('vf.dna.interests')}</label>
                  <textarea value={founderDNA.passion_topics} onChange={e => setFounderDNA({...founderDNA, passion_topics: e.target.value})} className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-hs-blue resize-none shadow-inner" placeholder="Wofür brennen Sie?" />
               </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Risk Appetite</label>
              <div className="grid grid-cols-3 gap-4">
                 {['Conservative', 'Balanced', 'High'].map(mode => (
                   <button key={mode} onClick={() => setFounderDNA({...founderDNA, risk_appetite: mode})} className={`py-4 rounded-2xl font-black uppercase text-xs transition-all border-2 ${founderDNA.risk_appetite === mode ? 'bg-hs-blue text-white border-hs-blue shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-hs-blue'}`}>
                     {mode}
                   </button>
                 ))}
              </div>
            </div>
            <button onClick={forgeConcepts} className="w-full bg-hs-blue text-white py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-xl flex items-center justify-center group">
               <Zap className="mr-3 group-hover:scale-125 transition-transform" /> {t('vf.btn.forge')}
            </button>
         </div>
       </div>
    </div>
  );

  const renderResult = () => (
    <div className="max-w-6xl mx-auto py-12 animate-fade-in space-y-12 px-4">
       <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-hs-blue uppercase tracking-tight mb-2">{t('vf.result.pipeline')}</h2>
          <p className="text-slate-500 font-medium">{t('vf.result.desc')}</p>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading ? (
             <div className="col-span-full">
               <AiWaiting
                 messages={language === 'de'
                   ? ['Ihr Profil wird ausgewertet …', 'Marktchancen werden abgeglichen …', 'Konzepte werden ausgearbeitet …']
                   : ['Evaluating your profile …', 'Matching market opportunities …', 'Developing concepts …']}
                 hint={tr('Das dauert meist 20–30 Sekunden.', 'This usually takes 20–30 seconds.')}
               />
             </div>
          ) : apiError ? (
             <div className="col-span-full max-w-xl mx-auto rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 text-center" role="alert">
                <p className="font-bold mb-4">{apiError}</p>
                <button onClick={forgeConcepts} className="bg-red-700 text-white px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-red-800">{tr('Erneut versuchen', 'Try again')}</button>
             </div>
          ) : concepts.map((c, i) => (
             <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col group">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-hs-orange mb-6 group-hover:bg-hs-blue group-hover:text-white transition-all duration-500">
                   <Lightbulb size={32} />
                </div>
                <h3 className="text-2xl font-black text-hs-blue uppercase mb-2 leading-none">{c.name}</h3>
                <p className="text-hs-accent font-black text-[10px] uppercase tracking-widest mb-6">{c.tagline}</p>
                <div className="space-y-4 mb-8 flex-grow">
                   <div className="bg-slate-50 p-4 rounded-xl text-xs leading-relaxed italic text-slate-600">"{c.problem_solved}"</div>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest"><TrendingUp size={10} className="inline mr-1"/> {tr('Exit-Szenario', 'Exit scenario')}: {c.exit_scenario_300k}</p>
                </div>
                <button onClick={() => handleDeepDive(c)} className="w-full bg-hs-blue text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-hs-orange transition-all shadow-md">Analyse vertiefen</button>
             </div>
          ))}
       </div>
    </div>
  );

  const renderDeepDive = () => {
    if (loading) return (
      <AiWaiting
        messages={language === 'de'
          ? ['Das Konzept wird vertieft …', 'Markt und Zielgruppe werden analysiert …', 'Roadmap und Risiken werden ausgearbeitet …']
          : ['Deepening the concept …', 'Analyzing market and target group …', 'Building roadmap and risks …']}
        hint={tr('Das dauert meist 20–40 Sekunden.', 'This usually takes 20–40 seconds.')}
      />
    );
    if (apiError || !deepDive || !selectedConcept) return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800" role="alert">
          <p className="font-bold mb-4">{apiError || tr('Keine Analyse vorhanden.', 'No analysis available.')}</p>
          <div className="flex justify-center gap-3">
            {selectedConcept && <button onClick={() => handleDeepDive(selectedConcept)} className="bg-red-700 text-white px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-red-800">{tr('Erneut versuchen', 'Try again')}</button>}
            <button onClick={() => setStep('RESULT')} className="bg-white border border-red-200 text-red-800 px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest">{tr('Zurück', 'Back')}</button>
          </div>
        </div>
      </div>
    );

    return (
      <div className="max-w-6xl mx-auto py-12 space-y-10 animate-fade-in px-4">
         <div className="bg-hs-blue text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10"><Cpu size={240} /></div>
            <div className="relative z-10">
               <button onClick={() => setStep('RESULT')} className="mb-6 flex items-center text-hs-accent hover:text-white transition-colors font-black uppercase text-xs tracking-widest">
                  <ArrowLeft size={16} className="mr-2" /> {tr('Zurück zur Pipeline', 'Back to pipeline')}
               </button>
               <h1 className="text-5xl font-black uppercase mb-4 tracking-tight">{selectedConcept.name}</h1>
               <p className="text-2xl text-slate-300 font-bold max-w-3xl leading-snug">{deepDive.usp_details}</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
               <h3 className="text-xl font-black text-hs-blue uppercase mb-8 flex items-center"><Target className="mr-3 text-hs-orange" /> {tr('Zielgruppe (Persona)', 'Target persona')}</h3>
               <p className="text-slate-600 leading-relaxed font-medium">{deepDive.target_persona}</p>
            </div>
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
               <h3 className="text-xl font-black text-hs-blue uppercase mb-8 flex items-center"><BarChart3 className="mr-3 text-hs-accent" /> {tr('Marktpotenzial', 'Market potential')}</h3>
               <p className="text-slate-600 leading-relaxed font-medium">{deepDive.market_potential}</p>
            </div>
         </div>

         <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-slate-100">
            <h3 className="text-2xl font-black text-hs-blue uppercase mb-12 text-center">{tr('Entwicklungs-Roadmap', 'Development roadmap')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {(deepDive.extended_roadmap ?? []).map((phase, i) => (
                 <div key={i} className="relative p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                    <div className="absolute -top-4 left-8 bg-hs-orange text-white px-4 py-1 rounded-full font-black text-[10px] uppercase shadow-md">{phase.duration}</div>
                    <h4 className="font-black text-hs-blue uppercase mt-4 mb-4">{phase.phase}</h4>
                    <ul className="space-y-3">
                       {(phase.milestones ?? []).map((m, j) => (
                         <li key={j} className="flex items-start text-xs font-medium text-slate-600"><CheckCircle size={12} className="text-emerald-500 mr-2 mt-0.5 flex-shrink-0" /> {m}</li>
                       ))}
                    </ul>
                 </div>
               ))}
            </div>
         </div>

         {/* Support Footer */}
         <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
               <Rocket size={160} className="text-hs-blue" />
            </div>
            <p className="text-lg font-bold text-hs-blue leading-relaxed relative z-10 max-w-2xl mx-auto">
               {tr('Gerne unterstützen wir Sie bei der Umsetzung - Wenden Sie sich an', 'We are happy to support you with the implementation. Please contact')} <span className="text-hs-orange">Andre Stuer</span> {tr('und', 'and')} <span className="text-hs-orange">Olaf Heger</span> {tr('mit der E-Mail-Adresse', 'at the email address')} <a href="mailto:kontakt@hs-results.com" className="text-hs-accent hover:text-hs-orange transition-colors underline decoration-2 underline-offset-4">kontakt@hs-results.com</a>
            </p>
         </div>
      </div>
    );
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50 px-4">
      <div className="max-w-7xl mx-auto">
        {step === 'LANDING' && renderLanding()}
        {step === 'ORG_CONTEXT' && <OrgContextForm user={user} onComplete={(data) => { setOrgInfo(data); setStep('CORP_SCAN'); }} />}
        {step === 'CORP_SCAN' && (
          <div className="max-w-4xl mx-auto py-12 animate-fade-in px-4">
             <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
                <h2 className="text-3xl font-black text-hs-blue uppercase mb-8 flex items-center"><ShieldAlert className="mr-3 text-hs-orange" /> {t('vf.scan.pain')}</h2>
                <textarea value={corpNeeds} onChange={(e) => setCorpNeeds(e.target.value)} className="w-full h-40 rounded-2xl border-slate-200 border-2 p-8 outline-none focus:border-hs-blue resize-none shadow-inner text-lg" placeholder="Was bremst Ihr Unternehmen aktuell massiv aus?" />
                <button onClick={() => setStep('PERSONAL_DNA')} className="w-full mt-8 bg-hs-blue text-white py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-xl flex items-center justify-center group">
                  Founder DNA checken <ChevronRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                </button>
             </div>
          </div>
        )}
        {step === 'PERSONAL_DNA' && renderDNA()}
        {step === 'RESULT' && renderResult()}
        {step === 'DEEP_DIVE' && renderDeepDive()}
      </div>
    </div>
  );
};