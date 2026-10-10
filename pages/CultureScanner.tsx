import React, { useState, useEffect } from 'react';
import { generateCultureHypotheses, generateCultureAnalysisPlan, generateCultureGoals, CultureHypothesis, CultureAnalysisResult } from '../services/geminiService';
import { ViewState, OrgContextData } from '../types';
import { 
  Loader2, ArrowRight, Brain, CheckCircle, ChevronRight, Layout, Sparkles, 
  Target, RefreshCw, ChevronLeft, Building, MessageCircle, ShieldAlert, Zap, ListChecks, PlayCircle, Globe, Download, Printer, Info, Users, Heart, Save, AlertCircle, Calendar, BarChart3, TrendingUp, MessageSquareText, Mail
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ResultTeaser } from '../components/ResultTeaser';
import { saveProjectSession } from '../services/firebase';
import { OrgContextForm } from '../components/OrgContextForm';
import { AiWaiting } from '../components/AiWaiting';

type Step = 'LANDING' | 'ORG_CONTEXT' | 'STORIES' | 'HYPOTHESES' | 'GOAL' | 'RESULT';

export const CultureScanner: React.FC<{ user: any, setView: (v: ViewState) => void }> = ({ user, setView }) => {
  const { t, language } = useLanguage();
  const tr = (de: string, en: string) => (language === 'de' ? de : en);
  const [step, setStep] = useState<Step>('LANDING');
  const [loading, setLoading] = useState(false);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Phase 0: Org Context
  const [orgInfo, setOrgInfo] = useState<OrgContextData | null>(null);

  // Phase 1: Stories
  const [stories, setStories] = useState({
    success: '',
    mistakes: '',
    conflicts: ''
  });

  // Phase 2: Hypotheses
  const [hypotheses, setHypotheses] = useState<CultureHypothesis[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});

  // Phase 3: Goal
  const [selectedDirection, setSelectedDirection] = useState('');
  const [dynamicDirections, setDynamicDirections] = useState<string[]>([]);

  // Phase 4: Result
  const [analysis, setAnalysis] = useState<CultureAnalysisResult | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleSaveSession = async () => {
    if (!user || !analysis) return;
    setSaveStatus('saving');
    try {
      await saveProjectSession(user.uid, {
        title: `Culture-Scan: ${selectedDirection.substring(0, 30)}...`,
        toolId: 'culture_scanner',
        inputs: {
          orgInfo,
          stories,
          hypotheses,
          ratings,
          direction: selectedDirection
        },
        results: analysis,
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
    if (!analysis || !analysis.profile || !orgInfo) return;
    const content = `
HS-RESULTS CULTURE SCAN REPORT
${tr('Titel', 'Title')}: ${analysis.profile.title}
${tr('Datum', 'Date')}: ${new Date().toLocaleString()}

${tr('ORGANISATION', 'ORGANIZATION')}:
- ${tr('Größe', 'Size')}: ${orgInfo.size}
- ${tr('Branche', 'Industry')}: ${orgInfo.industry}
- ${tr('Besteht seit', 'Established')}: ${orgInfo.establishedSince}
- ${tr('Innovationskraft', 'Innovation capability')}: ${orgInfo.innovationLevel}/10
- ${tr('Wirtschaftlichkeit', 'Profitability')}: ${orgInfo.profitability}/10
- ${tr('Hauptproblem', 'Main challenge')}: ${orgInfo.mainProblem}

${tr('ZUSAMMENFASSUNG', 'SUMMARY')}:
${analysis.profile.summary}

${tr('KULTURELLE BARRIEREN', 'CULTURAL BARRIERS')} (Shadow Culture):
${(analysis.profile.shadow_culture_traits || []).map(t => `- ${t}`).join('\n')}

${tr('ENTWICKLUNGSPOTENTIALE', 'DEVELOPMENT POTENTIAL')}:
${(analysis.profile.strengths || []).map(s => `- ${s}`).join('\n')}

${tr('STRATEGISCHE HEBEL', 'STRATEGIC LEVERS')}:
${(analysis.levers || []).map(l => `${l.area} (${l.impact}): ${l.description}`).join('\n')}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HS_CultureScan_${new Date().getTime()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const startHypothesesGeneration = async () => {
    if (!stories.success || !stories.mistakes) return;
    setLoading(true);
    setApiError(null);
    try {
      const fullContext = { ...stories, organization: orgInfo };
      const result = await generateCultureHypotheses(fullContext, language);
      if (result && result.length > 0) {
        setHypotheses(result);
        const initialRatings: Record<string, number> = {};
        result.forEach(h => initialRatings[h.id] = 3);
        setRatings(initialRatings);
        setStep('HYPOTHESES');
      } else {
        setApiError(language === 'de' ? 'Die KI hat keine Hypothesen geliefert.' : 'The AI did not return any hypotheses.');
      }
    } catch (error) {
      setApiError(language === 'de' ? 'Fehler bei der Hypothesen-Generierung.' : 'Could not generate hypotheses.');
    } finally {
      setLoading(false);
    }
  };

  const startGoalGeneration = async () => {
    setLoadingGoals(true);
    setApiError(null);
    try {
      const fullContext = {
        ...stories,
        organization: orgInfo,
        hypothesisRatings: hypotheses.map(h => ({ text: h.text, rating: ratings[h.id] }))
      };
      const result = await generateCultureGoals(fullContext, language);
      if (result && result.length > 0) {
        setDynamicDirections(result);
        setStep('GOAL');
      } else {
        setApiError(language === 'de' ? 'Die KI hat keine strategischen Zielrichtungen geliefert.' : 'The AI did not return any strategic directions.');
      }
    } catch (error) {
      setApiError(language === 'de' ? 'KI konnte keine strategischen Ziele erstellen.' : 'The AI could not create strategic directions.');
    } finally {
      setLoadingGoals(false);
    }
  };

  const generateFinal = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const formattedRatings = hypotheses.map(h => ({ text: h.text, rating: ratings[h.id] }));
      const fullContext = { ...stories, organization: orgInfo };
      const result = await generateCultureAnalysisPlan(fullContext, formattedRatings, selectedDirection, language);
      if (result) {
        setAnalysis(result);
        setStep('RESULT');
      } else {
        setApiError(language === 'de' ? 'Die KI hat keinen Analyseplan geliefert.' : 'The AI did not return an analysis plan.');
      }
    } catch (error) {
      setApiError(language === 'de' ? 'KI-Scan konnte nicht abgeschlossen werden.' : 'The AI scan could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const renderApiError = (retry: () => void) => apiError && (
    <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800" role="alert">
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
        <div className="flex-grow">
          <p className="font-bold">{apiError}</p>
          <button
            onClick={retry}
            className="mt-3 inline-flex items-center rounded-full bg-red-700 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-red-800"
          >
            <RefreshCw size={14} className="mr-2" />
            {language === 'de' ? 'Erneut versuchen' : 'Try again'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderLanding = () => (
    <div className="max-w-6xl mx-auto py-12 animate-fade-in px-4">
       <div className="flex flex-col lg:flex-row items-start gap-16 mb-24">
          <div className="lg:w-1/2 space-y-8">
             <div className="flex items-center space-x-4 mb-2">
                <div className="h-[3px] w-16 bg-hs-orange"></div>
                <p className="text-hs-orange font-black uppercase tracking-[0.3em] text-sm">{t('cult.subtitle')}</p>
             </div>
             <h1 className="text-6xl font-black text-hs-blue uppercase tracking-tight leading-[0.95]">{t('cult.title')}</h1>
             <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                <p className="font-bold text-hs-blue text-xl">{t('cult.landing.text1')}</p>
                <p>{t('cult.landing.text2')}</p>
                <div className="bg-hs-blue/5 p-8 rounded-[2.5rem] border-l-8 border-emerald-500 shadow-sm">
                   <p className="text-hs-blue font-bold leading-relaxed">{t('cult.landing.text3')}</p>
                </div>
                <p>{t('cult.landing.text4')}</p>
             </div>
             <div className="pt-8">
                <button onClick={() => setStep('ORG_CONTEXT')} className="bg-hs-blue text-white px-10 py-5 rounded-full font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-xl hover:-translate-y-1 flex items-center group">
                  {t('cult.btn.start')} <ArrowRight size={20} className="ml-3 group-hover:translate-x-2 transition-transform" />
                </button>
             </div>
          </div>
          <div className="lg:w-1/2 sticky top-24">
             <div className="relative group">
                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200" className="rounded-[3rem] shadow-2xl z-10 relative group-hover:scale-[1.02] transition-transform duration-700" alt="Culture" />
                <div className="absolute -bottom-8 -right-8 w-full h-full border-4 border-emerald-500/30 rounded-[3rem] -z-10 group-hover:-translate-x-2 transition-transform"></div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderStories = () => (
    <div className="max-w-4xl mx-auto py-12 animate-fade-in px-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        {loading ? <AiWaiting
          messages={language === 'de'
            ? ['Schritt 1 von 3: Ihre Geschichten werden ausgewertet …', 'Schritt 1 von 3: Kulturelle Muster werden erkannt …', 'Schritt 1 von 3: Hypothesen werden formuliert …']
            : ['Step 1 of 3: Evaluating your stories …', 'Step 1 of 3: Identifying cultural patterns …', 'Step 1 of 3: Formulating hypotheses …']}
          hint={language === 'de' ? 'Das dauert meist 15–30 Sekunden.' : 'This usually takes 15–30 seconds.'}
        /> : <>
        <h2 className="text-3xl font-black text-hs-blue uppercase mb-8">{tr('Kulturelle Erzählungen', 'Cultural stories')}</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{tr('Erfolgsgeschichte: Was macht uns stolz?', 'Success story: What makes us proud?')}</label>
            <textarea 
              value={stories.success} 
              onChange={e => setStories({...stories, success: e.target.value})} 
              className="w-full h-32 p-4 rounded-2xl border-2 border-slate-100 outline-none" 
              placeholder={tr('Beschreiben Sie eine Situation, die typisch für unseren Erfolg ist...', 'Describe a situation that is typical of our success...')}
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{tr('Umgang mit Fehlern: Was passiert, wenn etwas schiefgeht?', 'Response to mistakes: What happens when something goes wrong?')}</label>
            <textarea 
              value={stories.mistakes} 
              onChange={e => setStories({...stories, mistakes: e.target.value})} 
              className="w-full h-32 p-4 rounded-2xl border-2 border-slate-100 outline-none" 
              placeholder={tr('Wie wurde in der Vergangenheit mit einem großen Fehler umgegangen?', 'How was a major mistake handled in the past?')}
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{tr('Konflikte: Wie werden bei uns Differenzen gelöst?', 'Conflicts: How are differences resolved here?')}</label>
            <textarea 
              value={stories.conflicts} 
              onChange={e => setStories({...stories, conflicts: e.target.value})} 
              className="w-full h-32 p-4 rounded-2xl border-2 border-slate-100 outline-none" 
              placeholder={tr('Ein Beispiel für eine gelöste (oder ungelöste) Differenz...', 'An example of a resolved (or unresolved) difference...')}
            />
          </div>
          <button 
            onClick={startHypothesesGeneration} 
            disabled={loading || !stories.success || !stories.mistakes} 
            className="w-full bg-hs-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
            {tr('Hypothesen generieren', 'Generate hypotheses')}
          </button>
          {renderApiError(startHypothesesGeneration)}
        </div>
        </>}
      </div>
    </div>
  );

  const renderHypotheses = () => (
    <div className="max-w-4xl mx-auto py-12 animate-fade-in px-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        {loadingGoals ? <AiWaiting
          messages={language === 'de'
            ? ['Schritt 2 von 3: Ihre Bewertungen werden ausgewertet …', 'Schritt 2 von 3: Mögliche Zielrichtungen werden entwickelt …', 'Schritt 2 von 3: Strategische Optionen werden formuliert …']
            : ['Step 2 of 3: Evaluating your ratings …', 'Step 2 of 3: Developing possible directions …', 'Step 2 of 3: Formulating strategic options …']}
          hint={language === 'de' ? 'Das dauert meist 15–30 Sekunden.' : 'This usually takes 15–30 seconds.'}
        /> : <>
        <h2 className="text-3xl font-black text-hs-blue uppercase mb-2">{tr('Kultur-Hypothesen', 'Culture hypotheses')}</h2>
        <p className="text-slate-500 mb-8">{tr('Wie zutreffend sind diese Beobachtungen? (1 = gar nicht, 5 = absolut)', 'How accurate are these observations? (1 = not at all, 5 = absolutely)')}</p>
        <div className="space-y-8 mb-10">
          {hypotheses.map(h => (
            <div key={h.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-black text-hs-blue mb-2">{h.text}</h4>
              <p className="text-xs text-slate-500 mb-4 italic">{h.reasoning}</p>
              <div className="flex items-center space-x-4">
                <input 
                  type="range" min="1" max="5" 
                  value={ratings[h.id] || 3} 
                  onChange={(e) => setRatings({...ratings, [h.id]: parseInt(e.target.value)})} 
                  className="flex-grow accent-hs-orange"
                />
                <span className="font-black text-hs-blue w-8">{ratings[h.id] || 3}</span>
              </div>
            </div>
          ))}
        </div>
        <button 
          onClick={startGoalGeneration} 
          disabled={loadingGoals} 
          className="w-full bg-hs-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center"
        >
          {loadingGoals ? <Loader2 className="animate-spin mr-2" /> : <Target className="mr-2" />}
          {tr('Strategische Zielrichtungen finden', 'Find strategic directions')}
        </button>
        {renderApiError(startGoalGeneration)}
        </>}
      </div>
    </div>
  );

  const renderGoal = () => (
    <div className="max-w-4xl mx-auto py-12 animate-fade-in px-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        {loading ? <AiWaiting
          messages={language === 'de'
            ? ['Schritt 3 von 3: Ihre kulturellen Muster werden zusammengeführt …', 'Schritt 3 von 3: Strategische Hebel werden abgeleitet …', 'Schritt 3 von 3: Ihr Analyseplan wird erstellt …']
            : ['Step 3 of 3: Combining your cultural patterns …', 'Step 3 of 3: Deriving strategic levers …', 'Step 3 of 3: Creating your analysis plan …']}
          hint={language === 'de' ? 'Das dauert meist 15–30 Sekunden.' : 'This usually takes 15–30 seconds.'}
        /> : <>
        <h2 className="text-3xl font-black text-hs-blue uppercase mb-8">{tr('Strategischer Fokus', 'Strategic focus')}</h2>
        <div className="space-y-4 mb-10">
          {dynamicDirections.map((dir, i) => (
            <button 
              key={i} 
              onClick={() => setSelectedDirection(dir)} 
              className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${selectedDirection === dir ? 'border-hs-orange bg-orange-50' : 'border-slate-100 hover:border-hs-blue'}`}
            >
              <p className="font-bold text-hs-blue">{dir}</p>
            </button>
          ))}
        </div>
        <button 
          onClick={generateFinal} 
          disabled={loading || !selectedDirection} 
          className="w-full bg-hs-blue text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle size={20} className="mr-2" />}
          {tr('Finalen Kultur-Analyse-Plan erstellen', 'Create final culture analysis plan')}
        </button>
        {renderApiError(generateFinal)}
        </>}
      </div>
    </div>
  );

  const renderResult = () => {
    if (loading) return <div className="py-20 text-center"><Loader2 size={48} className="animate-spin mx-auto text-hs-blue mb-4" /><p className="font-bold">{tr('Analyse wird erstellt...', 'Creating analysis...')}</p></div>;
    if (!analysis) return null;

    if (!user) {
      const levers = analysis.levers?.length || 0;
      const interventions = analysis.interventions?.length || 0;
      return (
        <ResultTeaser
          title={tr('Kultur-Scan abgeschlossen', 'Culture scan completed')}
          lead={analysis.profile.summary}
          locked={[
            tr(`${levers} strategische Hebel`, `${levers} strategic levers`),
            tr(`${interventions} Handlungsoptionen und Sofort-Maßnahmen`, `${interventions} action options and immediate measures`),
            tr('6-Wochen-Experimentier-Plan', '6-week experimentation plan'),
          ]}
        />
      );
    }

    return (
      <div className="max-w-5xl mx-auto py-12 animate-fade-in space-y-10 px-4">
         <div className="bg-hs-blue text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-6 relative z-10">
               <h1 className="text-4xl font-black uppercase tracking-tight">{analysis.profile.title}</h1>
               <div className="flex space-x-2 no-print">
                  <button onClick={handleSaveSession} disabled={saveStatus !== 'idle'} className={`flex items-center space-x-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${saveStatus === 'saved' ? 'bg-emerald-500' : 'bg-white/10 hover:bg-white/20'}`}>
                    {saveStatus === 'saving' ? <Loader2 size={12} className="animate-spin" /> : saveStatus === 'saved' ? <CheckCircle size={12} /> : <Save size={12} />}
                    <span>{saveStatus === 'saved' ? tr('Gesichert', 'Saved') : tr('Sichern', 'Save')}</span>
                  </button>
                  <button
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                    onClick={handleDownload}
                    title={tr('Ergebnis herunterladen', 'Download result')}
                    aria-label={tr('Ergebnis herunterladen', 'Download result')}
                  >
                    <Download size={16}/>
                  </button>
               </div>
            </div>
            <p className="text-xl text-slate-300 leading-relaxed max-w-3xl relative z-10">{analysis.profile.summary}</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-xl border-l-8 border-hs-orange">
               <h3 className="text-xl font-black text-hs-orange uppercase mb-6 flex items-center"><ShieldAlert className="mr-2"/> Shadow Culture</h3>
               <ul className="space-y-4">
                  {(analysis.profile.shadow_culture_traits || []).map((t, i) => (
                    <li key={i} className="flex items-start text-slate-700 font-medium"><AlertCircle size={18} className="text-hs-orange mr-3 mt-1 flex-shrink-0" /> {t}</li>
                  ))}
               </ul>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-xl border-l-8 border-emerald-500">
               <h3 className="text-xl font-black text-emerald-600 uppercase mb-6 flex items-center"><Zap className="mr-2"/> {tr('Ressourcen', 'Strengths')}</h3>
               <ul className="space-y-4">
                  {(analysis.profile.strengths || []).map((s, i) => (
                    <li key={i} className="flex items-start text-slate-700 font-medium"><CheckCircle size={18} className="text-emerald-500 mr-3 mt-1 flex-shrink-0" /> {s}</li>
                  ))}
               </ul>
            </div>
         </div>

         <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
            <h3 className="text-2xl font-black text-hs-blue uppercase mb-8 flex items-center"><TrendingUp className="mr-3 text-hs-accent" /> {tr('Strategische Hebel', 'Strategic levers')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {(analysis.levers || []).map((l, i) => (
                 <div key={i} className="bg-slate-50 p-6 rounded-2xl border-t-4 border-hs-accent">
                    <p className="text-[10px] font-black text-hs-accent uppercase mb-2">{tr('Wirkung', 'Impact')}: {l.impact}</p>
                    <h4 className="font-black text-hs-blue mb-2">{l.area}</h4>
                    <p className="text-sm text-slate-600">{l.description}</p>
                 </div>
               ))}
            </div>
         </div>

         {/* MANAGEMENT ROADMAP & HANDLUNGSOPTIONEN */}
         <div className="space-y-10">
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
               <h3 className="text-2xl font-black text-hs-blue uppercase mb-8 flex items-center">
                  <ListChecks className="mr-3 text-hs-orange" /> 
                  {tr('Handlungsalternativen & Sofort-Maßnahmen', 'Action options & immediate measures')}
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(analysis.interventions || []).map((inv, i) => (
                    <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-hs-orange transition-colors">
                       <h4 className="text-hs-orange font-black uppercase text-xs mb-2">{inv.title}</h4>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{tr('Zielgruppe', 'Target group')}: {inv.target}</p>
                       <p className="text-sm text-slate-700 font-medium">{inv.action}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
               <h3 className="text-2xl font-black text-hs-blue uppercase mb-8 flex items-center">
                  <Calendar className="mr-3 text-hs-accent" /> 
                  {tr('6-Wochen Experimentier-Plan', '6-week experimentation plan')}
               </h3>
               <div className="space-y-4">
                  {(analysis.experiment_plan_6_weeks || []).map((exp, i) => (
                    <div key={i} className="flex flex-col md:flex-row md:items-center bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 md:space-y-0 md:space-x-8">
                       <div className="flex-shrink-0 w-24">
                          <span className="bg-hs-blue text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{exp.week}</span>
                       </div>
                       <div className="flex-grow">
                          <p className="text-[10px] font-black text-hs-accent uppercase tracking-widest mb-1">{exp.focus}</p>
                          <p className="text-sm font-bold text-hs-blue">{exp.experiment}</p>
                       </div>
                       <div className="flex-shrink-0 md:w-64 bg-white/50 p-3 rounded-xl border border-white">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{tr('Erfolgs-Signal', 'Success signal')}</p>
                          <p className="text-xs text-emerald-600 font-bold">{exp.success_signal}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Support Footer */}
         <div className="bg-hs-orange text-white p-12 rounded-[3rem] shadow-2xl text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
               <Mail size={160} />
            </div>
            <p className="text-xl font-bold leading-relaxed relative z-10 max-w-3xl mx-auto">
               {tr('Gerne unterstützen wir Sie bei der Umsetzung – wenden Sie sich an', 'We are happy to support you with implementation – contact')} <span className="text-hs-blue">Andre Stuer</span> {tr('und', 'and')} <span className="text-hs-blue">Olaf Heger</span> {tr('unter der E-Mail-Adresse', 'at')} <a href="mailto:kontakt@hs-results.com" className="text-white hover:text-hs-blue transition-colors underline decoration-2 underline-offset-4">kontakt@hs-results.com</a>
            </p>
         </div>
      </div>
    );
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50 px-4">
      <div className="max-w-7xl mx-auto">
        {step !== 'LANDING' && (
           <button onClick={() => { setStep('LANDING'); setApiError(null); setAnalysis(null); }} className="mb-6 flex items-center text-slate-400 hover:text-hs-blue transition-colors font-black uppercase text-xs tracking-widest no-print">
              <ChevronLeft size={16} className="mr-1" /> {t('nav.area_info')}
           </button>
        )}
        {step === 'LANDING' && renderLanding()}
        {step === 'ORG_CONTEXT' && <OrgContextForm user={user} onComplete={(data) => { setOrgInfo(data); setStep('STORIES'); }} />}
        {step === 'STORIES' && renderStories()}
        {step === 'HYPOTHESES' && renderHypotheses()}
        {step === 'GOAL' && renderGoal()}
        {step === 'RESULT' && renderResult()}
      </div>
    </div>
  );
};
