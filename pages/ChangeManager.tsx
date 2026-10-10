
import React, { useState, useEffect } from 'react';
import { generateChangeAnalysis, getAssessmentQuestions, generateSystemicQuestions } from '../services/geminiService';
import { AnalysisResult, ChangeToolId, ChangeToolDefinition, AssessmentQuestion, AssessmentResponse, OrgContext, ViewState, SavedProject, OrgContextData } from '../types';
import { 
  Loader2, AlertTriangle, FileText, Brain, 
  ListOrdered, ShieldAlert, Users, TrendingUp, Grid, Target, ArrowRight, ChevronLeft, CheckCircle, Building, Globe, Sparkles, MessageCircleQuestion,
  Heart, MessageSquareText, Cpu, BarChart3, PlayCircle, BookOpen, Printer, RefreshCw, Save, FolderOpen, ArrowRightLeft, ShieldCheck, Zap, Download, Mail, X, Check, Search, ListChecks, Map, Activity, ClipboardList, CheckSquare
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { AiWaiting } from '../components/AiWaiting';
import { ResultTeaser } from '../components/ResultTeaser';
import { Auth } from '../components/Auth';
import { saveProjectSession, db, collection, query, orderBy, onSnapshot } from '../services/firebase';
import { OrgContextForm } from '../components/OrgContextForm';

type Step = 'LANDING' | 'ORG_CONTEXT' | 'SETUP' | 'ASSESSMENT' | 'RESULT';

interface ChangeManagerProps {
  user: any;
  setView: (v: ViewState) => void;
  orgContext: OrgContext | null;
  clearOrgContext: () => void;
}

export const ChangeManager: React.FC<ChangeManagerProps> = ({ user, setView, orgContext, clearOrgContext }) => {
  const { t, language } = useLanguage();
  const [step, setStep] = useState<Step>('LANDING');
  
  // Inputs
  const [scenario, setScenario] = useState('');
  const [companyDesc, setCompanyDesc] = useState('');
  const [selectedTool, setSelectedTool] = useState<ChangeToolId>('plan_kotter');
  const [orgInfo, setOrgInfo] = useState<OrgContextData | null>(null);
  
  const [cultureQuestions, setCultureQuestions] = useState<AssessmentQuestion[]>([]);
  const [cultureAnswers, setCultureAnswers] = useState<Record<string, string>>({});
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const tr = (de: string, en: string) => (language === 'de' ? de : en);
  const [questionsGenerated, setQuestionsGenerated] = useState(false);

  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const TOOLS: ChangeToolDefinition[] = [
    { id: 'plan_kotter', name: t('tool.kotter'), description: t('tool.kotter.desc'), icon: ListOrdered },
    { id: 'story_creation', name: t('tool.story'), description: t('tool.story.desc'), icon: BookOpen },
    { id: 'analysis_swot', name: t('tool.swot'), description: t('tool.swot.desc'), icon: Grid },
    { id: 'model_adkar', name: t('tool.adkar'), description: t('tool.adkar.desc'), icon: Target },
    { id: 'analysis_stakeholder', name: t('tool.stakeholder'), description: t('tool.stakeholder.desc'), icon: Users },
    { id: 'analysis_gap', name: t('tool.gap'), description: t('tool.gap.desc'), icon: ArrowRightLeft },
    { id: 'risk_assessment', name: t('tool.risk'), description: t('tool.risk.desc'), icon: ShieldAlert },
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleGenerateCultureQuestions = async () => {
    if (!scenario.trim()) return;
    setGeneratingQuestions(true);
    setApiError(null);
    try {
      const fullPrompt = `${scenario} (Profile: ${JSON.stringify(orgInfo)})`;
      const qs = await generateSystemicQuestions(fullPrompt, companyDesc || "Organisation", language);
      setCultureQuestions(qs);
      if (!qs || qs.length === 0) throw new Error('No questions generated');
      setQuestionsGenerated(true);
    } catch (e) {
      console.error(e);
      setApiError(tr('Die Kultur-Fragen konnten nicht erstellt werden. Bitte versuchen Sie es erneut.', 'The culture questions could not be created. Please try again.'));
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleStartAssessment = () => {
    if (!scenario.trim()) return;
    const qs = getAssessmentQuestions(selectedTool, language);
    setQuestions(qs);
    setStep('ASSESSMENT');
  };

  const handleGenerateAnalysis = async () => {
    setLoading(true);
    setApiError(null);
    setResult(null);
    setStep('RESULT');
    try {
      const toolAnswers: AssessmentResponse[] = questions.map(q => ({
        questionId: q.id, questionText: q.text, answer: answers[q.id] || "No input"
      }));
      const cultAnswers: AssessmentResponse[] = cultureQuestions.map(q => ({
        questionId: q.id, questionText: q.text, answer: cultureAnswers[q.id] || "No input"
      }));

      const res = await generateChangeAnalysis(
        selectedTool, scenario, "N/A", companyDesc, "N/A", toolAnswers, cultAnswers, language, orgInfo
      );
      if (!res) throw new Error('Analysis empty');
      setResult(res);
    } catch (e) {
      console.error(e);
      setApiError(tr('Der Bericht konnte nicht erstellt werden. Bitte versuchen Sie es erneut.', 'The report could not be created. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSession = async () => {
    if (!user || !result) return;
    setSaveStatus('saving');
    try {
      await saveProjectSession(user.uid, {
        title: `Change-Analyse: ${selectedTool.replace('_', ' ')}`,
        toolId: 'change_manager',
        inputs: { scenario, selectedTool, orgInfo, answers, cultureAnswers },
        results: result,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      console.error(e);
      setSaveStatus('idle');
    }
  };

  const renderAssessment = () => (
    <div className="max-w-4xl mx-auto py-12 animate-fade-in space-y-10">
       <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
          <h2 className="text-3xl font-black text-hs-blue uppercase mb-8 flex items-center"><ListChecks className="mr-3 text-hs-orange" /> {t('cm.audit.title')}</h2>
          <div className="space-y-8 mb-10">
             {questions.map((q, i) => (
               <div key={q.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <label className="block text-sm font-bold text-hs-blue mb-3">{q.text}</label>
                  <textarea value={answers[q.id] || ''} onChange={e => setAnswers({...answers, [q.id]: e.target.value})} className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-hs-blue transition-all" placeholder={q.placeholder} />
               </div>
             ))}
          </div>
          <button onClick={handleGenerateAnalysis} className="w-full bg-hs-blue text-white py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-xl flex items-center justify-center">
             <Zap className="mr-3" /> {t('cm.btn.generate')}
          </button>
       </div>
    </div>
  );

  const renderResult = () => {
    if (loading) return (
      <AiWaiting
        messages={language === 'de'
          ? ['Ihre Antworten werden ausgewertet …', 'Unsichtbare Dynamiken werden herausgearbeitet …', 'Phasen und Maßnahmen werden abgeleitet …', 'Risiken und Kulturhebel werden bewertet …']
          : ['Evaluating your answers …', 'Working out hidden dynamics …', 'Deriving phases and actions …', 'Assessing risks and cultural levers …']}
        hint={tr('Der Bericht ist umfangreich, das dauert meist 30–45 Sekunden.', 'The report is extensive and usually takes 30–45 seconds.')}
      />
    );
    if (apiError || !result) return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800" role="alert">
          <p className="font-bold mb-4">{apiError || tr('Kein Bericht vorhanden.', 'No report available.')}</p>
          <div className="flex justify-center gap-3">
            <button onClick={handleGenerateAnalysis} className="bg-red-700 text-white px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest hover:bg-red-800">{tr('Erneut versuchen', 'Try again')}</button>
            <button onClick={() => setStep('ASSESSMENT')} className="bg-white border border-red-200 text-red-800 px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest">{tr('Zurück zu den Fragen', 'Back to questions')}</button>
          </div>
        </div>
      </div>
    );

    if (!user) {
      const d: any = result.data || {};
      const phases = d.phases?.length || 0;
      const actions = d.action_plan?.length || 0;
      const risks = d.risks?.length || 0;
      return (
        <ResultTeaser
          title={tr('Ihr Veränderungs-Bericht ist fertig', 'Your change report is ready')}
          lead={d.summary || result.summary}
          locked={language === 'de'
            ? ['Systemische Diagnose der unsichtbaren Dynamiken', `${phases} Phasen mit Beschreibung`, `${actions} konkrete Maßnahmen mit Priorität und Verantwortlichen`, `${risks} Risiken mit Gegenmaßnahmen und kulturelle Hebel`]
            : ['Systemic diagnosis of hidden dynamics', `${phases} phases with descriptions`, `${actions} concrete actions with priority and owners`, `${risks} risks with mitigations and cultural levers`]}
        />
      );
    }

    const data = result.data || {};
    const phases = data.phases || [];
    const risks = data.risks || [];
    const actionPlan = data.action_plan || [];
    const systemicDiagnosis = data.systemic_diagnosis || "";
    const culturalLevers = data.cultural_levers || [];

    return (
      <div className="max-w-6xl mx-auto py-12 space-y-12 animate-fade-in px-4">
         {/* Header */}
         <div className="bg-hs-blue text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10"><Map size={240} /></div>
            <div className="relative z-10">
               <div className="flex justify-between items-start mb-10">
                  <div className="flex space-x-3 no-print">
                     <button onClick={handleSaveSession} disabled={saveStatus !== 'idle'} className={`px-5 py-2 rounded-full text-xs font-black uppercase transition-all ${saveStatus === 'saved' ? 'bg-emerald-50 text-white' : 'bg-white/10 hover:bg-white/20'}`}>
                        {saveStatus === 'saving' ? <Loader2 size={12} className="animate-spin" /> : saveStatus === 'saved' ? <Check size={12} /> : <Save size={12} />}
                        <span className="ml-2">{saveStatus === 'saved' ? 'Gesichert' : 'Speichern'}</span>
                     </button>
                     <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 p-2 rounded-full"><Printer size={18}/></button>
                  </div>
                  <div className="bg-hs-orange px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center">
                    <Sparkles size={12} className="mr-2" /> Senior Expert Analysis
                  </div>
               </div>
               <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-hs-accent mb-4">Strategiebericht: {selectedTool.toUpperCase()}</h1>
               <h2 className="text-5xl font-black uppercase tracking-tight mb-8 leading-none">{result.summary}</h2>
               <div className="h-1 w-24 bg-hs-orange rounded-full mb-8"></div>
               <p className="text-xl text-slate-300 font-medium italic max-w-4xl">"{data.strategic_logic || "Systemische Neuausrichtung zur Sicherung der Zukunftsfähigkeit."}"</p>
            </div>
         </div>

         {/* Systemic Diagnosis */}
         <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col">
            <h3 className="text-2xl font-black text-hs-blue uppercase mb-8 flex items-center"><Brain className="mr-3 text-hs-orange" /> Systemische Diagnose</h3>
            <div className="prose prose-slate max-w-none">
               <p className="text-lg text-slate-600 leading-relaxed font-medium">
                  {systemicDiagnosis || "Analysierte Muster deuten auf eine strukturelle Trägheit hin, die durch gezielte Interventionen aufgebrochen werden muss."}
               </p>
            </div>
         </div>

         {/* Visual Graphic: The Impact Matrix */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col">
               <h3 className="text-2xl font-black text-hs-blue uppercase mb-8 flex items-center"><Activity className="mr-3 text-hs-orange" /> Impact Priority Map</h3>
               <div className="flex-grow min-h-[300px] relative border-l-2 border-b-2 border-slate-100 mt-4 mb-8 mx-8">
                  <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-black text-slate-300 uppercase tracking-widest">High Impact</div>
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest">Urgency</div>
                  
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                    <div className="border-r border-slate-50 border-dashed"></div>
                    <div className="border-slate-50 border-dashed"></div>
                  </div>

                  {Array.isArray(phases) && phases.slice(0, 5).map((p: any, i: number) => (
                    <div key={i} className="absolute p-4 rounded-3xl bg-hs-blue text-white shadow-xl flex items-center animate-fade-in group cursor-default hover:bg-hs-orange transition-all" 
                      style={{ 
                        left: `${20 + (i * 15)}%`, 
                        top: `${70 - (i * 12)}%`,
                        transform: `scale(${1 + (i * 0.05)})`
                      }}>
                        <span className="font-black text-[10px] mr-2 opacity-50">{i + 1}</span>
                        <span className="text-[10px] font-bold uppercase truncate max-w-[80px]">{typeof p === 'string' ? p.substring(0,15) : p.title?.substring(0,15)}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
               <div className="bg-hs-blue text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden h-full">
                  <h3 className="text-lg font-black uppercase mb-6 flex items-center"><Target className="mr-3 text-hs-accent" /> Kulturelle Hebel</h3>
                  <ul className="space-y-4">
                    {culturalLevers.map((lever: string, i: number) => (
                      <li key={i} className="flex items-start text-xs font-bold text-hs-accent bg-white/5 p-3 rounded-xl border border-white/10">
                        <CheckCircle size={14} className="mr-2 mt-0.5 shrink-0" /> {lever}
                      </li>
                    ))}
                  </ul>
               </div>
            </div>
         </div>

         {/* Detailed Roadmap */}
         <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
            <h3 className="text-xl font-black text-hs-blue uppercase mb-8 flex items-center"><TrendingUp className="mr-3 text-hs-accent" /> Transformation Roadmap</h3>
            <div className="space-y-6">
               {Array.isArray(phases) && phases.map((phase: any, i: number) => (
                 <div key={i} className="flex items-start group">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-hs-blue font-black text-sm mr-6 group-hover:bg-hs-blue group-hover:text-white transition-all shrink-0">
                       {i + 1}
                    </div>
                    <div className="border-b border-slate-50 pb-4 flex-grow">
                       <h4 className="font-bold text-hs-blue mb-1">{typeof phase === 'string' ? phase : (phase.title || phase.name || `Phase ${i+1}`)}</h4>
                       {phase.description && <p className="text-xs text-slate-500 leading-relaxed">{phase.description}</p>}
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* ACTION PLAN / TODO LIST */}
         <div className="bg-slate-50 p-12 rounded-[4rem] border-t-8 border-hs-orange shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
               <div className="flex items-center space-x-4">
                  <div className="bg-hs-orange text-white p-4 rounded-3xl shadow-lg">
                     <ClipboardList size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-hs-blue uppercase leading-none">Operative To-Do Liste</h3>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-2">Schritte zur unmittelbaren Umsetzung</p>
                  </div>
               </div>
               <div className="bg-white px-6 py-2 rounded-full border border-slate-200 text-[10px] font-black uppercase text-hs-blue tracking-widest">
                  {actionPlan.length} Maßnahmen identifiziert
               </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
               {Array.isArray(actionPlan) && actionPlan.map((todo: any, i: number) => (
                 <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-6 group hover:border-hs-orange transition-all">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${todo.priority === 'High' ? 'border-red-500 text-red-500' : 'border-slate-200 text-slate-200'} group-hover:border-hs-orange group-hover:text-hs-orange transition-colors`}>
                       <CheckSquare size={14} />
                    </div>
                    <div className="flex-grow">
                       <div className="flex items-center space-x-3 mb-1">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${todo.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>Prio: {todo.priority}</span>
                          <span className="text-[9px] font-black uppercase text-hs-accent">Target: {todo.target}</span>
                       </div>
                       <p className="font-bold text-hs-blue">{todo.task}</p>
                    </div>
                    <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="bg-hs-blue/5 text-hs-blue p-2 rounded-xl hover:bg-hs-blue hover:text-white transition-all"><ArrowRight size={16}/></button>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Risk Register */}
         <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-l-8 border-hs-orange h-fit">
            <h3 className="text-xl font-black text-hs-orange uppercase mb-8 flex items-center"><ShieldAlert className="mr-3" /> Risk & Mitigation Log</h3>
            <div className="space-y-4">
               {Array.isArray(risks) && risks.map((risk: any, i: number) => (
                 <div key={i} className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 group hover:border-hs-orange transition-all">
                    <p className="text-xs font-bold text-hs-blue">{typeof risk === 'string' ? risk : (risk.risk || risk.title)}</p>
                    {risk.mitigation && <p className="text-[10px] text-slate-500 mt-2 italic font-medium">Strategie: {risk.mitigation}</p>}
                 </div>
               ))}
            </div>
         </div>

         {/* Support Footer */}
         <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
               <Mail size={120} />
            </div>
            <p className="text-lg font-bold text-hs-blue leading-relaxed relative z-10 max-w-2xl mx-auto">
               Gerne unterstützen wir Sie bei der Umsetzung dieser To-Do Liste - Wenden Sie sich an <span className="text-hs-orange">Andre Stuer</span> und <span className="text-hs-orange">Olaf Heger</span> unter <a href="mailto:kontakt@hs-results.com" className="text-hs-accent hover:text-hs-orange transition-colors underline decoration-2 underline-offset-4">kontakt@hs-results.com</a>
            </p>
         </div>
      </div>
    );
  };

  const renderLanding = () => (
    <div className="max-w-6xl mx-auto py-12 animate-fade-in px-4">
       <div className="flex flex-col lg:flex-row items-start gap-16 mb-24">
          <div className="lg:w-1/2 space-y-8">
             <div className="flex items-center space-x-4 mb-2">
                <div className="h-[3px] w-16 bg-hs-orange"></div>
                <p className="text-hs-orange font-black uppercase tracking-[0.3em] text-sm">{t('cm.subtitle')}</p>
             </div>
             <h1 className="text-6xl font-black text-hs-blue uppercase tracking-tight leading-[0.95]">{t('cm.title')}</h1>
             <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                <p className="font-bold text-hs-blue text-xl">{t('cm.landing.main')}</p>
                <p>{t('cm.landing.text1')}</p>
                <div className="bg-hs-blue/5 p-8 rounded-[2.5rem] border-l-8 border-hs-orange shadow-sm">
                   <h4 className="font-black text-hs-blue uppercase text-xs tracking-widest mb-6">{t('cm.landing.list_title')}</h4>
                   <ul className="space-y-4">
                      {[1,2,3,4].map(i => (
                        <li key={i} className="flex items-start">
                           <CheckCircle className="text-hs-orange mr-3 mt-1 flex-shrink-0" size={18} />
                           <span className="text-sm font-bold text-hs-blue">{t(`cm.landing.item${i}`)}</span>
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
             <div className="pt-8">
                <button onClick={() => setStep('ORG_CONTEXT')} className="bg-hs-blue text-white px-10 py-5 rounded-full font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-xl hover:-translate-y-1 flex items-center group">
                  {t('cm.btn.start')} <ArrowRight size={20} className="ml-3 group-hover:translate-x-2 transition-transform" />
                </button>
             </div>
          </div>
          <div className="lg:w-1/2 space-y-12 sticky top-24">
             <div className="relative group">
                <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200" className="rounded-[3rem] shadow-2xl z-10 relative group-hover:scale-[1.02] transition-transform duration-700" alt="Change Management" />
                <div className="absolute -bottom-8 -right-8 w-full h-full border-4 border-hs-orange/30 rounded-[3rem] -z-10 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-700"></div>
                <div className="absolute -top-10 -left-10 bg-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center text-hs-blue animate-fade-in border border-slate-100">
                   <RefreshCw size={48} className="mb-2 text-hs-accent" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Continuous Flux</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50 px-4">
      <div className="max-w-7xl mx-auto">
        {step === 'LANDING' && renderLanding()}
        {step === 'ORG_CONTEXT' && <OrgContextForm user={user} onComplete={(data) => { setOrgInfo(data); setStep('SETUP'); }} />}
        {step === 'SETUP' && (
          <div className="max-w-4xl mx-auto py-12 animate-fade-in space-y-10">
             <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                <h2 className="text-3xl font-black text-hs-blue uppercase mb-8 flex items-center"><Brain className="mr-3 text-hs-orange" /> {t('cm.setup.title')}</h2>
                <div className="space-y-6">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('cm.setup.scenario')}</label>
                      <textarea value={scenario} onChange={e => setScenario(e.target.value)} className="w-full h-32 p-6 bg-slate-50 rounded-2xl border-slate-200 border-2 outline-none focus:border-hs-blue transition-all text-lg" placeholder="Was soll sich ändern? z.B. Einführung einer flachen Hierarchie..." />
                   </div>
                   {apiError && (
                     <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800" role="alert">{apiError}</div>
                   )}
                   <button onClick={handleGenerateCultureQuestions} disabled={generatingQuestions || !scenario} className="w-full bg-hs-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-lg flex items-center justify-center">
                      {generatingQuestions ? <Loader2 className="animate-spin mr-3" /> : <MessageCircleQuestion className="mr-3" />} {t('cm.btn.questions')}
                   </button>
                </div>
             </div>

             {questionsGenerated && (
               <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 animate-fade-in">
                  <h3 className="text-xl font-black text-hs-blue uppercase mb-8">{t('cm.setup.culture')}</h3>
                  <div className="space-y-6 mb-10">
                     {cultureQuestions.map(q => (
                       <div key={q.id}>
                          <label className="block text-sm font-bold text-slate-700 mb-2">{q.text}</label>
                          <textarea value={cultureAnswers[q.id] || ''} onChange={e => setCultureAnswers({...cultureAnswers, [q.id]: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-hs-accent" placeholder={q.placeholder} />
                       </div>
                     ))}
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Beratungs-Methode wählen</label>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {TOOLS.map(tool => (
                          <button key={tool.id} onClick={() => setSelectedTool(tool.id)} className={`p-6 rounded-2xl border-2 text-left transition-all ${selectedTool === tool.id ? 'border-hs-blue bg-hs-blue/5 ring-4 ring-hs-blue/10' : 'border-slate-50 hover:border-hs-blue hover:bg-slate-50'}`}>
                             <div className="flex items-center space-x-3 mb-2">
                                <tool.icon size={20} className={selectedTool === tool.id ? 'text-hs-blue' : 'text-slate-400'} />
                                <span className="font-black uppercase text-xs tracking-tight">{tool.name}</span>
                             </div>
                             <p className="text-[10px] text-slate-500 leading-relaxed">{tool.description}</p>
                          </button>
                        ))}
                     </div>
                  </div>
                  <button onClick={handleStartAssessment} className="w-full mt-10 bg-hs-orange text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-hs-blue transition-all shadow-xl">Audit Starten</button>
               </div>
             )}
          </div>
        )}
        {step === 'ASSESSMENT' && renderAssessment()}
        {step === 'RESULT' && renderResult()}
      </div>
    </div>
  );
};
