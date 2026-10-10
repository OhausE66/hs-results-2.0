
import React, { useState, useEffect } from 'react';
import { generateStrategyOptions, generateStrategyFinalPlan, StrategyOption, StrategyPlanResult } from '../services/geminiService';
import { ViewState, OrgContext, OrgContextData } from '../types';
import { 
  Loader2, ArrowRight, Brain, CheckCircle, ChevronRight, Layout, Sparkles, 
  Target, RefreshCw, ChevronLeft, Building, MessageCircle, ShieldAlert, Zap, ListChecks, PlayCircle, Globe, Download, Printer, Info, Compass, Flag, TrendingUp, Users, Lightbulb, Save, AlertCircle, Map, Briefcase, BarChart3, ShieldCheck, Mail, X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Auth } from '../components/Auth';
import { saveProjectSession } from '../services/firebase';
import { OrgContextForm } from '../components/OrgContextForm';

interface StrategyClarifierProps {
  user: any;
  setView: (v: ViewState) => void;
  setOrgContext: (context: OrgContext) => void;
}

export const StrategyClarifier: React.FC<StrategyClarifierProps> = ({ user, setView, setOrgContext }) => {
  const { t, language } = useLanguage();
  const tr = (de: string, en: string) => (language === 'de' ? de : en);
  const [step, setStep] = useState<'LANDING' | 'ORG_CONTEXT' | 'SETUP' | 'OPTIONS' | 'DEEP_DIVE' | 'RESULT'>('LANDING');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [apiError, setApiError] = useState<string | null>(null);
  const [orgInfo, setOrgInfo] = useState<OrgContextData | null>(null);
  
  // Phase 1: Setup
  const [context, setContext] = useState({
    name: '',
    desc: '',
    url: '',
    win_with: '',
    for_whom: '',
    why_now: ''
  });

  // Phase 2: Options
  const [options, setOptions] = useState<StrategyOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Phase 3: Deep Dive
  const [deepDiveQuestions] = useState([
    { id: 'q1', text: language === 'de' ? "Welche Kernressourcen müssen wir umschichten, um diesen Weg zu gehen?" : "Which core resources must we reallocate to take this path?", placeholder: "Personal, Budget, Fokus..." },
    { id: 'q2', text: language === 'de' ? "Auf welche 3 Dinge müssen wir konsequent verzichten?" : "Which 3 things must we consistently give up?", placeholder: "Projekte, Kunden, Märkte..." },
    { id: 'q3', text: language === 'de' ? "Welche kulturelle Hürde ist am gefährlichsten für diesen Plan?" : "Which cultural hurdle is most dangerous for this plan?", placeholder: "Angst, Silo-Denken, Trägheit..." }
  ]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Phase 4: Result
  const [plan, setPlan] = useState<StrategyPlanResult | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleSaveSession = async () => {
    if (!user || !plan) return;
    setSaveStatus('saving');
    try {
      await saveProjectSession(user.uid, {
        title: `Strategy: ${context.name || 'Plan'}`,
        toolId: 'strategy_clarifier',
        inputs: { context, selectedOptionId, answers, orgInfo },
        results: plan,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      console.error("Save error", e);
      setSaveStatus('idle');
    }
  };

  const startOptionsGeneration = async () => {
    if (!context.win_with || !context.for_whom || !context.why_now) return;
    setLoading(true);
    setApiError(null);
    try {
      const fullContext = { ...context, orgProfile: orgInfo };
      const res = await generateStrategyOptions(fullContext, language);
      if (res && res.length > 0) {
        setOptions(res);
        setStep('OPTIONS');
      } else {
        throw new Error("No options generated");
      }
    } catch (error) {
      console.error(error);
      setApiError(language === 'de' ? "KI-Assistent ist kurzzeitig überlastet. Bitte erneut versuchen." : "AI Assistant is briefly overloaded. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateFinal = async () => {
    const selected = options.find(o => o.id === selectedOptionId);
    if (!selected) return;
    setLoading(true);
    setApiError(null);
    setStep('RESULT');
    try {
      const formattedAnswers = deepDiveQuestions.map(q => ({
        questionId: q.id,
        questionText: q.text,
        answer: answers[q.id] || "No Answer"
      }));
      const fullContext = { ...context, orgProfile: orgInfo };
      const res = await generateStrategyFinalPlan(fullContext, selected, formattedAnswers, language);
      if (res) {
        setPlan(res);
      } else {
        throw new Error("Plan was empty");
      }
    } catch (error) {
      console.error(error);
      setApiError(language === 'de' ? "Die Strategie-Finalisierung ist fehlgeschlagen. Bitte versuchen Sie es erneut." : "Strategy finalization failed. Please try again.");
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
                <p className="text-hs-orange font-black uppercase tracking-[0.3em] text-sm">Expertise</p>
             </div>
             <h1 className="text-6xl font-black text-hs-blue uppercase tracking-tight leading-[0.95]">
                {t('strat.title')}
             </h1>
             <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                <p className="font-bold text-hs-blue text-xl leading-snug">{t('strat.subtitle')}</p>
                <p>{t('strat.landing.text1')}</p>
                <div className="bg-hs-blue/5 p-8 rounded-[2.5rem] border-l-8 border-hs-orange shadow-sm">
                   <p className="text-hs-blue font-bold leading-relaxed">
                      {t('strat.landing.text2')}
                   </p>
                </div>
             </div>
             <div className="pt-8">
                <button onClick={() => setStep('ORG_CONTEXT')} className="bg-hs-blue text-white px-10 py-5 rounded-full font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-xl hover:-translate-y-1 flex items-center group">
                  {t('strat.btn.start')}
                  <ArrowRight size={20} className="ml-3 group-hover:translate-x-2 transition-transform" />
                </button>
             </div>
          </div>
          <div className="lg:w-1/2 sticky top-24">
             <div className="relative group">
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200" className="rounded-[3rem] shadow-2xl z-10 relative group-hover:scale-[1.02] transition-transform duration-700" alt="Strategy Board" />
                <div className="absolute -bottom-8 -right-8 w-full h-full border-4 border-hs-orange/30 rounded-[3rem] -z-10 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-700"></div>
                <div className="absolute -top-10 -left-10 bg-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center text-hs-blue animate-fade-in border border-slate-100">
                   <Compass size={48} className="mb-2 text-hs-orange" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strategic Vision</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderSetup = () => (
    <div className="max-w-4xl mx-auto py-12 animate-fade-in px-4">
       <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
         <h1 className="text-3xl font-black text-hs-blue uppercase mb-8 flex items-center"><Compass className="mr-3 text-hs-orange" /> {t('strat.setup.title')}</h1>
         <div className="space-y-6">
            {apiError && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center mb-4">
                <AlertCircle className="mr-2" size={20} />
                <p className="text-sm font-bold">{apiError}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('strat.setup.name')}</label>
                 <input value={context.name} onChange={e => setContext({...context, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-hs-blue" placeholder={tr('z.B. Digital Unit 2025', 'e.g. Digital Unit 2025')} />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{tr('Zielgruppe', 'Target group')}</label>
                 <input value={context.for_whom} onChange={e => setContext({...context, for_whom: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-hs-blue" placeholder={tr('Wer profitiert?', 'Who benefits?')} />
               </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{tr('Warum gerade jetzt? (Dringlichkeit)', 'Why now? (urgency)')}</label>
              <textarea value={context.why_now} onChange={e => setContext({...context, why_now: e.target.value})} className="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-hs-blue resize-none" placeholder={tr('Was hat sich am Markt geändert?', 'What has changed in the market?')} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{tr('Womit gewinnen wir?', 'What do we win with?')}</label>
              <textarea value={context.win_with} onChange={e => setContext({...context, win_with: e.target.value})} className="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-hs-blue resize-none" placeholder={tr('Technologie, Preis, Service ...', 'Technology, price, service ...')} />
            </div>
            <button onClick={startOptionsGeneration} disabled={loading || !context.win_with} className="w-full bg-hs-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-lg flex items-center justify-center">
              {loading ? <Loader2 className="animate-spin mr-3" /> : <Sparkles className="mr-3" />}
              Optionen ermitteln
            </button>
         </div>
       </div>
    </div>
  );

  const renderOptions = () => (
    <div className="max-w-4xl mx-auto py-12 animate-fade-in px-4">
       <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
         <h2 className="text-3xl font-black text-hs-blue uppercase mb-8">{t('strat.options.title')}</h2>
         <div className="grid grid-cols-1 gap-4 mb-10">
            {options.map((opt) => (
              <button key={opt.id} onClick={() => setSelectedOptionId(opt.id)} className={`p-8 rounded-3xl border-2 text-left transition-all ${selectedOptionId === opt.id ? 'border-hs-orange bg-orange-50' : 'border-slate-50 hover:border-hs-blue hover:bg-slate-50'}`}>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-black text-hs-blue uppercase text-lg tracking-tight">{opt.title}</h4>
                  {selectedOptionId === opt.id && <CheckCircle className="text-hs-orange" size={24} />}
                </div>
                <p className="text-slate-600 mb-4">{opt.description}</p>
                <div className="bg-white/50 p-4 rounded-xl text-xs border border-white">
                  <p className="font-bold text-hs-accent uppercase tracking-widest mb-1">Opportunity Space</p>
                  <p>{opt.opportunity_space}</p>
                </div>
              </button>
            ))}
         </div>
         <button onClick={() => setStep('DEEP_DIVE')} disabled={!selectedOptionId} className="w-full bg-hs-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center">
            {t('strat.btn.deepdive')} <ArrowRight className="ml-3" />
         </button>
       </div>
    </div>
  );

  const renderDeepDive = () => (
    <div className="max-w-4xl mx-auto py-12 animate-fade-in px-4">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
        <h2 className="text-3xl font-black text-hs-blue uppercase mb-4">{t('strat.deep.title')}</h2>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-8">Systemische Konfrontation</p>
        <div className="space-y-8 mb-10">
          {deepDiveQuestions.map(q => (
            <div key={q.id}>
              <label className="block text-sm font-bold text-hs-blue mb-3">{q.text}</label>
              <textarea 
                value={answers[q.id] || ''} 
                onChange={e => setAnswers({...answers, [q.id]: e.target.value})} 
                className="w-full h-32 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:border-hs-orange transition-all" 
                placeholder={q.placeholder}
              />
            </div>
          ))}
        </div>
        <button onClick={generateFinal} className="w-full bg-hs-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center">
           {loading ? <Loader2 className="animate-spin mr-3" /> : <Target className="mr-3" />}
           {t('strat.btn.finalize')}
        </button>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!user) return <Auth inline={true} />;
    
    if (loading) return (
      <div className="max-w-4xl mx-auto py-20 text-center px-4">
        <Loader2 size={64} className="animate-spin mx-auto text-hs-blue mb-6" />
        <h2 className="text-2xl font-black text-hs-blue uppercase animate-pulse">{t('strat.result.generating')}</h2>
      </div>
    );

    if (apiError) return (
      <div className="max-w-4xl mx-auto py-20 text-center px-4">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-red-100">
          <AlertCircle size={64} className="animate-bounce mx-auto text-red-500 mb-6" />
          <h2 className="text-2xl font-black text-hs-blue uppercase mb-4">{language === 'de' ? 'Ups! Da ist was schiefgelaufen.' : 'Oops! Something went wrong.'}</h2>
          <p className="text-slate-500 mb-8">{apiError}</p>
          <button onClick={() => setStep('DEEP_DIVE')} className="bg-hs-blue text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-xl">
             Nochmal versuchen
          </button>
        </div>
      </div>
    );

    if (!plan) return null;

    return (
      <div className="max-w-6xl mx-auto py-12 space-y-12 animate-fade-in px-4">
        {/* Header Panel */}
        <div className="bg-hs-blue text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10"><Map size={240} /></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-10">
              <div className="flex space-x-3 no-print">
                <button onClick={handleSaveSession} disabled={saveStatus !== 'idle'} className={`px-5 py-2 rounded-full text-xs font-black uppercase transition-all ${saveStatus === 'saved' ? 'bg-emerald-50 text-white' : 'bg-white/10 hover:bg-white/20'}`}>
                  {saveStatus === 'saving' ? <Loader2 size={12} className="animate-spin" /> : saveStatus === 'saved' ? <CheckCircle size={12} /> : <Save size={12} />}
                  <span className="ml-2">{saveStatus === 'saved' ? tr('Gesichert', 'Saved') : tr('Speichern', 'Save')}</span>
                </button>
                <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 p-2 rounded-full"><Printer size={18}/></button>
              </div>
            </div>
            <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-hs-accent mb-4">Finaler Strategie-Plan</h1>
            <h2 className="text-5xl font-black uppercase tracking-tight mb-8 leading-none">{plan.one_page_strategy.vision_statement}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{t('strat.result.target')}</h4>
                  <p className="text-xl text-slate-300 font-medium">{plan.one_page_strategy.target_audience}</p>
               </div>
               <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{t('strat.result.usp')}</h4>
                  <p className="text-xl text-slate-300 font-medium">{plan.one_page_strategy.unique_value_proposition}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Implementation Logic */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
              <h3 className="text-2xl font-black text-hs-blue uppercase mb-8 flex items-center"><TrendingUp className="mr-3 text-hs-orange" /> Initiative Portfolio</h3>
              <div className="space-y-6">
                 {plan.implementation.initiative_portfolio.map((init, i) => (
                   <div key={i} className="flex items-center space-x-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-hs-blue transition-all">
                      <div className={`w-3 h-12 rounded-full ${init.priority === 'High' ? 'bg-red-500' : init.priority === 'Medium' ? 'bg-hs-orange' : 'bg-emerald-500'}`} />
                      <div className="flex-grow">
                         <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Priority: {init.priority}</p>
                         <h4 className="font-bold text-hs-blue">{init.name}</h4>
                         <p className="text-xs text-slate-500 mt-1">{init.impact}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           <div className="space-y-8">
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 h-full">
                 <h3 className="text-xl font-black text-hs-blue uppercase mb-6 flex items-center"><BarChart3 className="mr-3 text-hs-accent" /> KPIs</h3>
                 <div className="space-y-6">
                    {plan.implementation.kpi_framework.map((kpi, i) => (
                      <div key={i} className="border-b border-slate-100 pb-4 last:border-0">
                         <p className="font-bold text-hs-blue text-sm">{kpi.kpi}</p>
                         <p className="text-hs-accent font-black uppercase text-xs mt-1">{kpi.target}</p>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Roadmap */}
        <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-slate-100">
           <h3 className="text-2xl font-black text-hs-blue uppercase mb-12 text-center">Implementation Roadmap</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plan.roadmap.map((phase, i) => (
                <div key={i} className="relative p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col">
                   <div className="absolute -top-4 left-8 bg-hs-blue text-white px-6 py-2 rounded-full font-black text-xs uppercase shadow-lg">{phase.timing}</div>
                   <h4 className="font-black text-hs-blue uppercase mt-4 mb-6">{phase.phase}</h4>
                   <ul className="space-y-3 flex-grow">
                      {phase.milestones.map((ms, j) => (
                        <li key={j} className="flex items-start text-xs text-slate-600 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-hs-accent mt-1.5 mr-3 flex-shrink-0" /> {ms}
                        </li>
                      ))}
                   </ul>
                </div>
              ))}
           </div>
        </div>

        {/* Risk Mitigation */}
        <div className="bg-hs-orange/10 p-10 rounded-[3rem] border border-hs-orange/20">
           <h3 className="text-xl font-black text-hs-orange uppercase mb-8 flex items-center"><ShieldCheck className="mr-3" /> Risk Assessment</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {plan.risks.map((risk, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm flex items-start space-x-4">
                   <div className="p-3 bg-red-50 text-red-500 rounded-xl"><AlertCircle size={20}/></div>
                   <div>
                      <h4 className="font-bold text-hs-blue text-sm mb-1">{risk.risk}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed"><span className="font-black uppercase text-[9px] text-hs-orange">{tr('Gegenmaßnahme:', 'Mitigation:')}</span> {risk.mitigation}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Support Footer */}
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 text-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-105 transition-transform duration-500 pointer-events-none">
              <Compass size={180} className="text-hs-orange" />
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
        {step !== 'LANDING' && (
           <button onClick={() => { setStep('LANDING'); setPlan(null); setApiError(null); }} className="mb-6 flex items-center text-slate-400 hover:text-hs-blue transition-colors font-black uppercase text-xs tracking-widest no-print">
              <ChevronLeft size={16} className="mr-1" /> {tr('Zur Übersicht', 'Back to overview')}
           </button>
        )}
        {step === 'LANDING' && renderLanding()}
        {step === 'ORG_CONTEXT' && <OrgContextForm user={user} onComplete={(data) => { setOrgInfo(data); setStep('SETUP'); }} />}
        {step === 'SETUP' && renderSetup()}
        {step === 'OPTIONS' && renderOptions()}
        {step === 'DEEP_DIVE' && renderDeepDive()}
        {step === 'RESULT' && renderResult()}
      </div>
    </div>
  );
};
