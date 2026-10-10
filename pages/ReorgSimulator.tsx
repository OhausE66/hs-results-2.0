import React, { useState, useEffect } from 'react';
import { processReorgStep, ReorgSimulatorOutput, ReorgQuestionState } from '../services/geminiService';
import { ViewState, OrgContext, OrgContextData } from '../types';
import { 
  Loader2, ArrowRight, Brain, AlertCircle, CheckCircle, 
  ChevronRight, Layout, ListChecks, MessageCircle, Presentation, 
  Zap, Calendar, BarChart, Info, ShieldAlert, Sparkles, RefreshCw, Download, Building, Globe, ChevronLeft, Settings, PlayCircle, PlusCircle, Save, MessageSquareText, Send, Mail, X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ResultTeaser } from '../components/ResultTeaser';
import { saveProjectSession } from '../services/firebase';
import { OrgContextForm } from '../components/OrgContextForm';

interface ReorgSimulatorProps {
  user: any;
  setView: (view: ViewState) => void;
  setOrgContext: (context: OrgContext) => void;
  orgContext: OrgContext | null;
}

export const ReorgSimulator: React.FC<ReorgSimulatorProps> = ({ user, setView, setOrgContext, orgContext }) => {
  const { t, language } = useLanguage();
  const tr = (de: string, en: string) => (language === 'de' ? de : en);
  const [step, setStep] = useState<'LANDING' | 'ORG_CONTEXT' | 'INITIAL' | 'WIZARD' | 'RESULT'>('LANDING');
  const [history, setHistory] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<{ text: string; options: string[] } | null>(null);
  const [finalResult, setFinalResult] = useState<ReorgSimulatorOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [apiError, setApiError] = useState<string | null>(null);
  const [customAnswer, setCustomAnswer] = useState('');
  const [orgInfo, setOrgInfo] = useState<OrgContextData | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Effekt zur Übernahme der Audit-Daten
  useEffect(() => {
    if (orgContext && !userInput) {
      const summaryPrefix = language === 'de' 
        ? `BASISDATEN AUS ORGANISATIONS-AUDIT:\nZusammenfassung: ${orgContext.summary}\nHandlungsfelder: ${orgContext.weaknesses.join(', ')}\n\nSIMULATIONS-SZENARIO:\n`
        : `DATA FROM ORGANIZATION AUDIT:\nSummary: ${orgContext.summary}\nAction areas: ${orgContext.weaknesses.join(', ')}\n\nSIMULATION SCENARIO:\n`;
      
      setUserInput(summaryPrefix);
      // Wenn wir Daten haben, können wir direkt zum Szenario-Schritt springen
      setStep('INITIAL');
    }
  }, [orgContext]);

  const handleSaveSession = async () => {
    if (!user || !finalResult) return;
    setSaveStatus('saving');
    try {
      await saveProjectSession(user.uid, {
        title: `Reorg-Sim: ${userInput.substring(0, 30)}...`,
        toolId: 'reorg_simulator',
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

  const startSimulator = async () => {
    if (!userInput.trim()) return;
    setLoading(true);
    setApiError(null);
    setStep('WIZARD');
    setQuestionCount(0);
    
    const initialPrompt = language === 'de' 
      ? `Ich möchte eine Reorganisations-Simulation starten. SZENARIO: ${userInput} WEBSEITE: ${companyUrl || 'N/A'}. ORG-KONTEXT: ${JSON.stringify(orgInfo)}. Bitte leite die Simulation mit der ersten strategischen Frage ein.`
      : `I want to start a reorganization simulation. SCENARIO: ${userInput} WEBSITE: ${companyUrl || 'N/A'}. ORG-CONTEXT: ${JSON.stringify(orgInfo)}. Please initiate the simulation with the first strategic question.`;
    
    const initialHistory: { role: 'user' | 'model'; parts: { text: string }[] }[] = [{ role: 'user', parts: [{ text: initialPrompt }] }];
    setHistory(initialHistory);

    try {
      const response = await processReorgStep(initialHistory, language);
      handleAIResponse(response);
    } catch (error: any) {
      console.error(error);
      setStep('INITIAL');
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
      { role: 'model', parts: [{ text: language === 'de' ? `Strategische Frage: ${currentQText}` : `Strategic Question: ${currentQText}` }] }, 
      { role: 'user', parts: [{ text: language === 'de' ? `Entscheidung: ${answer}` : `Decision: ${answer}` }] }
    ];
    setHistory(newHistory);
    setCustomAnswer('');

    try {
      const response = await processReorgStep(newHistory, language);
      setQuestionCount(prev => prev + 1);
      handleAIResponse(response);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAIResponse = (response: ReorgQuestionState) => {
    if (response.final_result) {
      setFinalResult(response.final_result);
      setStep('RESULT');
    } else if (response.next_question) {
      setCurrentQuestion(response.next_question);
    } else {
      setStep('INITIAL');
    }
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50 px-4">
      <div className="max-w-7xl mx-auto">
        {step === 'LANDING' && (
           <div className="max-w-4xl mx-auto text-center py-20">
              <h1 className="text-5xl font-black text-hs-blue uppercase mb-6">Reorg Simulator</h1>
              <p className="text-xl text-slate-500 mb-10 leading-relaxed">{tr('Simulieren Sie Transformationen mit systemischer KI-Begleitung basierend auf Ihrem individuellen Organisationsprofil.', 'Simulate transformations with systemic AI support, based on your individual organization profile.')}</p>
              <button onClick={() => setStep('ORG_CONTEXT')} className="bg-hs-orange text-white px-10 py-5 rounded-full font-black uppercase tracking-widest hover:bg-hs-blue transition-all shadow-xl">Simulation Konfigurieren</button>
           </div>
        )}
        {step === 'ORG_CONTEXT' && <OrgContextForm user={user} onComplete={(data) => { setOrgInfo(data); setStep('INITIAL'); }} />}
        {step === 'INITIAL' && (
          <div className="max-w-4xl mx-auto py-12 animate-fade-in">
             <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
                <h2 className="text-2xl font-black text-hs-blue uppercase mb-8">Change Szenario</h2>
                <textarea 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={tr('Welche Standorte sollen zusammengelegt werden? Welche Rollen fallen weg?', 'Which sites are to be merged? Which roles will be eliminated?')}
                  className="w-full h-48 rounded-2xl border-slate-200 border-2 p-6 text-lg outline-none transition-all shadow-inner"
                />
                <button onClick={startSimulator} disabled={!userInput.trim() || loading} className="w-full mt-6 bg-hs-orange text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-hs-blue transition-all shadow-lg">Simulation Starten</button>
             </div>
          </div>
        )}
        {step === 'WIZARD' && (
           <div className="max-w-3xl mx-auto py-12">
              <div className="bg-white p-10 rounded-3xl shadow-2xl border-t-8 border-hs-orange">
                 {loading ? <Loader2 className="animate-spin mx-auto text-hs-orange py-20" /> : currentQuestion && (
                   <div className="space-y-8">
                      <h2 className="text-2xl font-black text-hs-blue">{currentQuestion.text}</h2>
                      <div className="grid grid-cols-1 gap-4">
                         {currentQuestion.options.map((opt, i) => (
                           <button key={i} onClick={() => submitAnswer(opt)} className="text-left p-6 rounded-2xl border-2 border-slate-100 hover:border-hs-orange transition-all font-bold text-slate-700 flex justify-between items-center group">{opt} <ArrowRight className="text-slate-300 group-hover:text-hs-orange" /></button>
                         ))}
                      </div>
                   </div>
                 )}
              </div>
           </div>
        )}
        {step === 'RESULT' && finalResult && (
          !user ? (
            <ResultTeaser
              title={language === 'de' ? 'Simulation beendet' : 'Simulation completed'}
              lead={finalResult.impact_analysis.description}
              locked={language === 'de'
                ? ['Impact-Analyse mit Annahmen', '30-60-90-Tage-Fahrplan', 'Risikoregister mit Frühwarnsignalen', 'Kommunikationsplan mit Antworten auf typische Fragen']
                : ['Impact analysis with assumptions', '30-60-90 day roadmap', 'Risk register with early signals', 'Communication plan with answers to typical questions']}
            />
          ) : (
            <div className="max-w-6xl mx-auto py-12 space-y-10 animate-fade-in px-4">
               <div className="bg-hs-blue text-white p-10 rounded-3xl shadow-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <h1 className="text-4xl font-black uppercase">{finalResult.impact_analysis.title}</h1>
                    <div className="flex space-x-2 no-print">
                      <button onClick={handleSaveSession} disabled={saveStatus !== 'idle'} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all ${saveStatus === 'saved' ? 'bg-emerald-50 text-white' : 'bg-white/10 hover:bg-white/20'}`}>
                        {saveStatus === 'saving' ? <Loader2 size={12} className="animate-spin" /> : saveStatus === 'saved' ? <CheckCircle size={12} /> : <Save size={12} />}
                        <span className="ml-2">{saveStatus === 'saved' ? tr('Gesichert', 'Saved') : tr('Speichern', 'Save')}</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xl text-slate-300">{finalResult.impact_analysis.description}</p>
               </div>
               
               {/* Support Footer */}
               <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100 text-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000 pointer-events-none">
                     <Mail size={160} />
                  </div>
                  <p className="text-lg font-bold text-hs-blue leading-relaxed relative z-10">
                     {tr('Gerne unterstützen wir Sie bei der Umsetzung - Wenden Sie sich an', 'We are happy to support you with the implementation. Please contact')} <span className="text-hs-orange">Andre Stuer</span> {tr('und', 'and')} <span className="text-hs-orange">Olaf Heger</span> {tr('mit der E-Mail-Adresse', 'at the email address')} <a href="mailto:kontakt@hs-results.com" className="text-hs-accent hover:text-hs-orange transition-colors underline decoration-2 underline-offset-4">kontakt@hs-results.com</a>
                  </p>
               </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};