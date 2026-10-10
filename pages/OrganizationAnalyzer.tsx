import React, { useState, useEffect } from 'react';
import { processOrgAnalysisStep, OrgAnalysisOutput, OrgQuestionState } from '../services/geminiService';
import { ViewState, OrgContext, OrgContextData } from '../types';
import { 
  Loader2, ArrowRight, CheckCircle, ChevronRight, Layout, Sparkles, 
  RefreshCw, ChevronLeft, Settings, Zap, ShieldAlert, PlayCircle, Users, Download, Save, AlertCircle, MessageSquareText, Send, TrendingUp, Target, BarChart3, ListChecks, Mail
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ResultTeaser } from '../components/ResultTeaser';
import { saveProjectSession } from '../services/firebase';
import { OrgContextForm } from '../components/OrgContextForm';
import { AiWaiting } from '../components/AiWaiting';

interface OrganizationAnalyzerProps {
  user: any;
  setView: (view: ViewState) => void;
  setOrgContext: (context: OrgContext) => void;
}

export const OrganizationAnalyzer: React.FC<OrganizationAnalyzerProps> = ({ user, setView, setOrgContext }) => {
  const { t, language } = useLanguage();
  const [step, setStep] = useState<'LANDING' | 'ORG_CONTEXT' | 'SETUP' | 'WIZARD' | 'RESULT'>('LANDING');
  const [history, setHistory] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<{ text: string; options: string[] } | null>(null);
  const [finalResult, setFinalResult] = useState<OrgAnalysisOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [apiError, setApiError] = useState<string | null>(null);
  const [customAnswer, setCustomAnswer] = useState('');
  const [orgInfo, setOrgInfo] = useState<OrgContextData | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const loadExampleScenario = () => {
    if (language === 'de') {
      setUserInput("Mittelständischer Automobilzulieferer (450 MA) mit strenger funktionaler Hierarchie. Extrem lange Entscheidungswege, da die Geschäftsführung in operative Details involviert ist. Silo-Denken zwischen Entwicklung und Produktion führt zu Qualitätsmängeln an Schnittstellen.");
    } else {
      setUserInput("Medium-sized automotive supplier (450 employees) with a strict functional hierarchy. Extremely long decision-making processes because senior management is involved in operational details. Silo thinking between development and production leads to quality defects at interfaces.");
    }
  };

  const handleSaveSession = async () => {
    if (!user || !finalResult) return;
    setSaveStatus('saving');
    try {
      await saveProjectSession(user.uid, {
        title: `Org-Audit: ${userInput.substring(0, 30)}...`,
        toolId: 'organization_analyzer',
        inputs: {
          prompt: userInput,
          url: companyUrl,
          history: history,
          orgInfo
        },
        results: finalResult,
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

  const handleDownload = () => {
    if (!finalResult) return;
    const content = `
HS-RESULTS ORGANIZATION AUDIT
Maturity Score: ${finalResult.maturity_score}/100
Datum: ${new Date().toLocaleString()}

ORGANISATION:
- Branche: ${orgInfo?.industry}
- Größe: ${orgInfo?.size}

EXECUTIVE SUMMARY:
${finalResult.executive_summary}

STÄRKEN:
${(finalResult.strengths || []).map(s => `- ${s}`).join('\n')}

SCHWACHSTELLEN:
${(finalResult.weaknesses || []).map(w => `- ${w}`).join('\n')}

ROADMAP (QUICK WINS):
${(finalResult.optimization_proposals?.short_term || []).map(p => `- ${p}`).join('\n')}

ROADMAP (STRATEGISCH):
${(finalResult.optimization_proposals?.long_term || []).map(p => `- ${p}`).join('\n')}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HS_OrgAudit_${new Date().getTime()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const startAnalysis = async () => {
    if (!userInput.trim()) return;
    setLoading(true);
    setApiError(null);
    setStep('WIZARD');
    setQuestionCount(0);
    
    const initialPrompt = language === 'de' 
      ? `Ich möchte ein tiefgehendes Organisations-Audit durchführen. KONTEXT: ${userInput} WEBSEITE: ${companyUrl || 'Keine Angabe'}. ORG-PROFIL: ${JSON.stringify(orgInfo)}. Bitte starte den Prozess mit der ersten systemischen Frage.`
      : `I want to conduct an in-depth organizational audit. CONTEXT: ${userInput} WEBSITE: ${companyUrl || 'Not specified'}. ORG-PROFILE: ${JSON.stringify(orgInfo)}. Please start the process with the first systemic question.`;
    
    const initialHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [{ role: 'user', parts: [{ text: initialPrompt }] }];
    setHistory(initialHistory);

    try {
      const response = await processOrgAnalysisStep(initialHistory, language);
      handleAIResponse(response, initialHistory);
    } catch (error: any) {
      console.error(error);
      setApiError("Verbindung unterbrochen.");
      setStep('SETUP');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answer: string) => {
    setLoading(true);
    setApiError(null);
    
    const currentQText = currentQuestion?.text || "Next step";
    const newHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [
      ...history, 
      { role: 'model', parts: [{ text: language === 'de' ? `Frage: ${currentQText}` : `Question: ${currentQText}` }] }, 
      { role: 'user', parts: [{ text: language === 'de' ? `Antwort: ${answer}` : `Answer: ${answer}` }] }
    ];
    setHistory(newHistory);
    setCustomAnswer('');

    try {
      const response = await processOrgAnalysisStep(newHistory, language);
      setQuestionCount(prev => prev + 1);
      handleAIResponse(response, newHistory);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIResponse = (response: OrgAnalysisOutput | OrgQuestionState, currentHistory: any[]) => {
    const res = response as OrgQuestionState;
    if (res.final_result) {
      setFinalResult(res.final_result);
      setOrgContext({
        scenario: userInput,
        companyDesc: `Org Audit for: ${userInput}`, 
        summary: res.final_result.executive_summary,
        strengths: res.final_result.strengths || [],
        weaknesses: res.final_result.weaknesses || []
      });
      setStep('RESULT');
    } else if (res.next_question) {
      setCurrentQuestion(res.next_question);
    }
  };

  const renderLanding = () => (
    <div className="max-w-6xl mx-auto py-12 animate-fade-in px-4">
       <div className="flex flex-col lg:flex-row items-start gap-16 mb-24">
          <div className="lg:w-1/2 space-y-8">
             <div className="flex items-center space-x-4 mb-2">
                <div className="h-[3px] w-16 bg-hs-orange"></div>
                <p className="text-hs-orange font-black uppercase tracking-[0.3em] text-sm">{t('home.portfolio.label')}</p>
             </div>
             <h1 className="text-6xl font-black text-hs-blue uppercase tracking-tight leading-[0.95]">
                {t('org.title')}
             </h1>
             <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                <p className="font-bold text-hs-blue text-xl">{t('org.subtitle')}</p>
                <p>{t('org.desc1')}</p>
                <div className="bg-hs-blue/5 p-8 rounded-[2rem] border-l-8 border-hs-accent shadow-sm">
                   <p className="italic font-bold text-hs-blue text-xl">"{t('org.quote')}"</p>
                </div>
                <p>{t('org.desc2')}</p>
                <p>{t('org.desc3')}</p>
             </div>
          </div>
          <div className="lg:w-1/2">
             <div className="relative group">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200" className="rounded-[3rem] shadow-2xl z-10 relative" alt="Workshop" />
                <div className="absolute -bottom-8 -right-8 w-full h-full border-4 border-hs-orange/30 rounded-[3rem] -z-10"></div>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border-t-[12px] border-hs-blue hover:shadow-2xl transition-all cursor-pointer group" onClick={() => setStep('ORG_CONTEXT')}>
             <div className="bg-hs-blue/10 w-20 h-20 rounded-2xl flex items-center justify-center text-hs-blue mb-8 group-hover:bg-hs-blue group-hover:text-white transition-all">
                <Layout size={40} />
             </div>
             <h2 className="text-3xl font-black text-hs-blue uppercase mb-4">{t('org.audit.title')}</h2>
             <p className="text-slate-500 mb-8">{t('org.audit.desc')}</p>
             <div className="flex items-center text-hs-blue font-black uppercase text-xs tracking-widest group-hover:translate-x-2 transition-transform">
                {language === 'de' ? 'Audit Starten' : 'Start Audit'} <ArrowRight size={18} className="ml-2 text-hs-orange" />
             </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-xl border-t-[12px] border-hs-orange hover:shadow-2xl transition-all cursor-pointer group" onClick={() => setView(ViewState.REORG_SIMULATOR)}>
             <div className="bg-hs-orange/10 w-20 h-20 rounded-2xl flex items-center justify-center text-hs-orange mb-8 group-hover:bg-hs-orange group-hover:text-white transition-all">
                <Settings size={40} />
             </div>
             <h2 className="text-3xl font-black text-hs-orange uppercase mb-4">{t('org.sim.title')}</h2>
             <p className="text-slate-500 mb-8">{t('org.sim.desc')}</p>
             <div className="flex items-center text-hs-orange font-black uppercase text-xs tracking-widest group-hover:translate-x-2 transition-transform">
                {language === 'de' ? 'Simulator Starten' : 'Start Simulator'} <ArrowRight size={18} className="ml-2 text-hs-blue" />
             </div>
          </div>
       </div>
    </div>
  );

  const renderResult = () => {
    if (!finalResult) return null;
    
    if (!user) {
      const de = language === 'de';
      const strengths = finalResult.strengths?.length || 0;
      const weaknesses = finalResult.weaknesses?.length || 0;
      const proposals = (finalResult.optimization_proposals?.short_term?.length || 0) + (finalResult.optimization_proposals?.long_term?.length || 0);
      return (
        <ResultTeaser
          title={de ? 'Audit abgeschlossen' : 'Audit completed'}
          score={{ label: t('org.result.score'), value: finalResult.maturity_score, max: 100 }}
          lead={finalResult.executive_summary}
          locked={[
            de ? `${strengths} Stärken Ihrer Organisation` : `${strengths} strengths of your organization`,
            de ? `${weaknesses} Handlungsfelder` : `${weaknesses} areas for action`,
            de ? `${proposals} konkrete Maßnahmen, kurz- und langfristig` : `${proposals} concrete measures, short and long term`,
          ]}
        />
      );
    }

    return (
      <div className="max-w-6xl mx-auto py-12 space-y-12 animate-fade-in px-4">
         {/* Result Header */}
         <div className="bg-hs-blue text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10"><Target size={240} /></div>
            <div className="relative z-10">
               <div className="flex justify-between items-start mb-10">
                  <div className="flex space-x-3">
                     <span className="bg-hs-orange text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center">
                        <CheckCircle size={14} className="mr-2"/> Audit Completed
                     </span>
                     <div className="flex space-x-2 no-print">
                        <button onClick={handleSaveSession} disabled={saveStatus !== 'idle'} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all ${saveStatus === 'saved' ? 'bg-emerald-50 text-white' : 'bg-white/10 hover:bg-white/20'}`}>
                          {saveStatus === 'saving' ? <Loader2 size={12} className="animate-spin" /> : saveStatus === 'saved' ? <CheckCircle size={12} /> : <Save size={12} />}
                          <span className="ml-2">{saveStatus === 'saved' ? 'Gesichert' : 'Speichern'}</span>
                        </button>
                        <button onClick={handleDownload} className="bg-white/10 hover:bg-white/20 p-2 rounded-full"><Download size={18}/></button>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] mb-1">{t('org.result.score')}</p>
                     <p className="text-6xl font-black tracking-tighter">{finalResult.maturity_score}<span className="text-lg text-hs-accent">/100</span></p>
                  </div>
               </div>
               <h1 className="text-4xl font-black uppercase tracking-tight mb-6">Audit Resultat</h1>
               <p className="text-xl text-slate-300 leading-relaxed max-w-4xl font-medium">{finalResult.executive_summary}</p>
            </div>
         </div>

         {/* Stärken/Schwächen */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border-l-8 border-emerald-500 hover:shadow-2xl transition-all">
               <h3 className="text-2xl font-black text-emerald-600 uppercase mb-8 flex items-center"><Zap className="mr-3"/> Stärken</h3>
               <ul className="space-y-4">
                  {finalResult.strengths.map((s, i) => (
                    <li key={i} className="flex items-start text-slate-700 font-bold bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <CheckCircle size={20} className="text-emerald-500 mr-4 mt-0.5 flex-shrink-0" /> {s}
                    </li>
                  ))}
               </ul>
            </div>
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border-l-8 border-hs-orange hover:shadow-2xl transition-all">
               <h3 className="text-2xl font-black text-hs-orange uppercase mb-8 flex items-center"><ShieldAlert className="mr-3"/> Handlungsfelder</h3>
               <ul className="space-y-4">
                  {finalResult.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start text-slate-700 font-bold bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <AlertCircle size={20} className="text-hs-orange mr-4 mt-0.5 flex-shrink-0" /> {w}
                    </li>
                  ))}
               </ul>
            </div>
         </div>

         {/* Roadmap */}
         <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-slate-100">
            <h3 className="text-3xl font-black text-hs-blue uppercase mb-12 flex items-center justify-center">
               <TrendingUp className="mr-4 text-hs-accent" size={32} /> {t('org.result.roadmap')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-8">
                  <div className="flex items-center space-x-4 mb-6">
                     <div className="bg-hs-accent text-white p-3 rounded-2xl shadow-lg"><Zap size={24}/></div>
                     <h4 className="text-xl font-black text-hs-blue uppercase">{t('org.result.quickwins')}</h4>
                  </div>
                  <div className="space-y-4">
                     {finalResult.optimization_proposals.short_term.map((p, i) => (
                        <div key={i} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 font-bold text-slate-600 hover:border-hs-accent transition-colors">
                           {p}
                        </div>
                     ))}
                  </div>
               </div>
               <div className="space-y-8">
                  <div className="flex items-center space-x-4 mb-6">
                     <div className="bg-hs-blue text-white p-3 rounded-2xl shadow-lg"><Target size={24}/></div>
                     <h4 className="text-xl font-black text-hs-blue uppercase">{t('org.result.strategic')}</h4>
                  </div>
                  <div className="space-y-4">
                     {finalResult.optimization_proposals.long_term.map((p, i) => (
                        <div key={i} className="p-6 bg-hs-blue/5 rounded-[2rem] border border-hs-blue/10 font-bold text-hs-blue hover:border-hs-orange transition-colors">
                           {p}
                        </div>
                     ))}
                  </div>
               </div>
            </div>
            
            <div className="mt-16 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-hs-orange"><Settings size={32} /></div>
                  <div>
                     <h5 className="font-black text-hs-blue uppercase text-lg">Reorg-Simulation starten?</h5>
                     <p className="text-slate-500 text-sm">Nutzen Sie diese Ergebnisse direkt für eine digitale Simulation.</p>
                  </div>
               </div>
               <button onClick={() => setView(ViewState.REORG_SIMULATOR)} className="bg-hs-orange text-white px-10 py-5 rounded-full font-black uppercase tracking-widest hover:bg-hs-blue transition-all shadow-xl flex items-center">
                  Simulator Starten <ArrowRight className="ml-3" />
               </button>
            </div>
         </div>

         {/* Support Footer */}
         <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl text-center relative overflow-hidden border border-white/10 group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
               <Mail size={200} />
            </div>
            <p className="text-xl font-bold leading-relaxed relative z-10 max-w-3xl mx-auto">
               Gerne unterstützen wir Sie bei der Umsetzung - Wenden Sie sich an <span className="text-hs-orange">Andre Stuer</span> und <span className="text-hs-orange">Olaf Heger</span> mit der email-Adresse <a href="mailto:kontakt@hs-results.com" className="text-hs-accent hover:text-hs-orange transition-colors underline decoration-2 underline-offset-8">kontakt@hs-results.com</a>
            </p>
         </div>
      </div>
    );
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50 px-4">
      <div className="max-w-7xl mx-auto">
        {step === 'LANDING' && renderLanding()}
        {step === 'ORG_CONTEXT' && <OrgContextForm user={user} onComplete={(data) => { setOrgInfo(data); setStep('SETUP'); }} />}
        {step === 'SETUP' && (
           <div className="max-w-4xl mx-auto py-12 animate-fade-in">
              <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
                 <button onClick={() => setStep('LANDING')} className="mb-8 flex items-center text-slate-400 hover:text-hs-blue transition-colors font-black uppercase text-xs tracking-widest"><ChevronLeft size={16} className="mr-1" /> Zurück</button>
                 <h2 className="text-3xl font-black text-hs-blue uppercase mb-8 flex items-center"><Layout className="mr-3 text-hs-orange" /> {t('org.setup.title')}</h2>
                 <div className="space-y-6">
                    <textarea value={userInput} onChange={e => setUserInput(e.target.value)} className="w-full h-48 p-8 bg-slate-50 border-2 border-slate-200 rounded-[2.5rem] outline-none focus:border-hs-blue transition-all text-lg shadow-inner" placeholder={t('org.placeholder.desc')} />
                    <div className="flex space-x-4">
                       <button onClick={loadExampleScenario} className="flex-grow bg-slate-100 text-slate-600 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Beispiel laden</button>
                       <button onClick={startAnalysis} disabled={loading || !userInput} className="flex-[3] bg-hs-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-xl flex items-center justify-center">
                          {loading ? <Loader2 className="animate-spin mr-3" /> : <Sparkles className="mr-3" />} Audit-Prozess starten
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        )}
        {step === 'WIZARD' && (
           <div className="max-w-3xl mx-auto py-12 animate-fade-in">
              <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100">
                 <div className="flex justify-between items-center mb-10">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Audit Step {questionCount + 1} / 4</p>
                    <div className="flex space-x-1">
                       {[0,1,2,3].map(i => <div key={i} className={`w-8 h-1 rounded-full ${i <= questionCount ? 'bg-hs-accent' : 'bg-slate-100'}`} />)}
                    </div>
                 </div>
                 {loading ? (
                    <AiWaiting
                       messages={language === 'de'
                         ? ['Ihre Antwort wird ausgewertet …', 'Muster in Ihrer Organisation werden verknüpft …', 'Die nächste Frage wird formuliert …']
                         : ['Evaluating your answer …', 'Connecting patterns in your organization …', 'Formulating the next question …']}
                       hint={language === 'de' ? 'Das dauert meist 15–30 Sekunden.' : 'This usually takes 15–30 seconds.'}
                    />
                 ) : currentQuestion ? (
                    <div className="space-y-10">
                       <h3 className="text-3xl font-black text-hs-blue leading-tight">{currentQuestion.text}</h3>
                       <div className="grid grid-cols-1 gap-4">
                          {currentQuestion.options.map((opt, i) => (
                             <button key={i} onClick={() => submitAnswer(opt)} className="p-6 rounded-2xl border-2 border-slate-50 bg-slate-50 text-left font-bold text-slate-700 hover:border-hs-orange hover:bg-orange-50 transition-all flex justify-between items-center group">
                                {opt} <ChevronRight className="text-slate-300 group-hover:text-hs-orange transition-transform" />
                             </button>
                          ))}
                       </div>
                       <div className="pt-8 border-t border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center"><MessageSquareText size={14} className="mr-2" /> Eigene Antwort</p>
                          <div className="relative">
                             <input type="text" value={customAnswer} onChange={e => setCustomAnswer(e.target.value)} className="w-full p-5 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-hs-blue shadow-inner pr-16" placeholder="Ihre spezifische Antwort..." />
                             <button onClick={() => submitAnswer(customAnswer)} disabled={!customAnswer} className="absolute right-2 top-2 bottom-2 bg-hs-blue text-white p-3 rounded-xl hover:bg-hs-orange transition-all disabled:opacity-30"><Send size={20}/></button>
                          </div>
                       </div>
                    </div>
                 ) : null}
              </div>
           </div>
        )}
        {step === 'RESULT' && renderResult()}
      </div>
    </div>
  );
};