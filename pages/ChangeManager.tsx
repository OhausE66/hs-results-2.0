
import React, { useState } from 'react';
import { generateChangeAnalysis, getAssessmentQuestions, generateSystemicQuestions } from '../services/geminiService';
import { AnalysisResult, ChangeToolId, ChangeToolDefinition, AssessmentQuestion, AssessmentResponse } from '../types';
import { 
  Loader2, AlertTriangle, Send, FileText, Brain, 
  ListOrdered, ShieldAlert, Users, TrendingUp, Grid, Target, ArrowRight, ChevronLeft, CheckCircle, Building, Globe, Sparkles, MessageCircleQuestion,
  Heart, MessageSquareText, Cpu, BarChart3, PlayCircle, BookOpen, Printer, Download, RefreshCw
} from 'lucide-react';

const TOOLS: ChangeToolDefinition[] = [
  { 
    id: 'story_creation', 
    name: "Change Story Generator", 
    description: "Erstellung einer starken Narrative (Drache vs. Prinzessin vs. Hybrid).",
    icon: BookOpen 
  },
  { 
    id: 'plan_kotter', 
    name: "Kotter's 8 Steps", 
    description: "Klassischer Stufenplan für nachhaltige Veränderungsprozesse.",
    icon: ListOrdered 
  },
  { 
    id: 'analysis_swot', 
    name: "SWOT Analyse", 
    description: "Identifikation von Stärken, Schwächen, Chancen und Risiken.",
    icon: Grid 
  },
  { 
    id: 'analysis_stakeholder', 
    name: "Stakeholder Matrix", 
    description: "Analyse der Interessensgruppen und Kommunikationsstrategien.",
    icon: Users 
  },
  { 
    id: 'model_adkar', 
    name: "ADKAR Modell", 
    description: "Fokus auf individuelle Veränderung (Awareness, Desire, etc.).",
    icon: Target 
  },
  { 
    id: 'analysis_gap', 
    name: "GAP Analyse", 
    description: "Vergleich von Ist-Zustand und Zielbild mit Aktionsplan.",
    icon: TrendingUp 
  },
  { 
    id: 'risk_assessment', 
    name: "Systemische Risiken", 
    description: "Erkennung von Widerständen und kulturellen Barrieren.",
    icon: ShieldAlert 
  },
  { 
    id: 'tool_culture_amp', 
    name: "Culture Amp Strategy", 
    description: "Engagement & Retention Strategie für Change-Phasen.",
    icon: Heart 
  },
  { 
    id: 'tool_qualtrics', 
    name: "Qualtrics EmployeeXM", 
    description: "Employee Journey & Sentiment-Analyse an Touchpoints.",
    icon: MessageSquareText 
  },
  { 
    id: 'tool_viva', 
    name: "Microsoft Viva Insights", 
    description: "Datenbasierte Analyse von Kollaboration & Workload.",
    icon: Cpu 
  },
];

// --- DEMO DATA START ---
const DEMO_DATA = {
  scenario: "Digitale Transformation: Einführung einer neuen cloud-basierten ERP-Plattform, die 20 Jahre alte Legacy-Systeme ablöst. Der Vertrieb weigert sich, die neuen CRM-Module zu nutzen, weil sie 'zu kompliziert' seien und der persönliche Kontakt verloren ginge.",
  companyDesc: "Die TechMotive GmbH ist ein traditionsreicher deutscher Maschinenbauer mit stolzer Ingenieurskultur. Wir legen extremen Wert auf Präzision und Hierarchie. Fehler werden ungern zugegeben. 'Das haben wir schon immer so gemacht' ist ein häufiger Satz.",
  companySize: "Großunternehmen (250+ MA)",
  companyUrl: "https://demo.techmotive-gmbh.de",
  cultureQuestions: [
    { id: 'd1', text: "Wie wird in Ihrer Ingenieurskultur aktuell mit Unwissenheit oder Lernbedarf umgegangen?", placeholder: "..." },
    { id: 'd2', text: "Welches ungeschriebene Gesetz über Hierarchien könnte die Einführung einer kollaborativen Cloud-Lösung blockieren?", placeholder: "..." },
    { id: 'd3', text: "Wenn der Vertrieb 'Nein' sagt, wer hat dann wirklich das letzte Wort?", placeholder: "..." },
    { id: 'd4', text: "Was müssten Sie tun, um sicherzustellen, dass die IT-Abteilung und der Vertrieb sich gegenseitig sabotieren?", placeholder: "..." }
  ],
  cultureAnswers: {
    'd1': "Lernbedarf wird oft als Schwäche ausgelegt. Man muss Experte sein. Fragen stellen ist riskant.",
    'd2': "Information ist Macht. Cloud bedeutet Transparenz, das bedroht die Wissensmonopole der Abteilungsleiter.",
    'd3': "Der Vertriebsvorstand (Sales VP) ist der heimliche König. Wenn er blockt, passiert nichts.",
    'd4': "Wir müssten der IT erlauben, das System ohne Einbeziehung des Vertriebs 'perfekt' zu konfigurieren und es dann am Montag einfach freizuschalten."
  },
  selectedTool: 'story_creation' as ChangeToolId,
  toolAnswers: {
    'st1': "Der Drache ist die Irrelevanz. Wenn wir nicht schneller werden, fressen uns die agilen Wettbewerber aus Asien auf, die halb so teuer und doppelt so schnell liefern.",
    'st2': "Die Prinzessin ist die Freiheit. Keine Excel-Listen mehr pflegen, sondern Echtzeit-Daten haben und sich wieder auf echte Ingenieurskunst konzentrieren.",
    'st3': "Fokus auf das mittlere Management, die aktuell Angst vor Kontrollverlust haben.",
    'st4': "Eher 'Fight the Dragon'. Wir brauchen einen Weckruf."
  }
};
// --- DEMO DATA END ---

type Step = 'SETUP' | 'ASSESSMENT' | 'RESULT';

export const ChangeManager: React.FC = () => {
  const [step, setStep] = useState<Step>('SETUP');
  
  // Step 1 State
  const [scenario, setScenario] = useState('');
  const [companySize, setCompanySize] = useState('Mittelstand (50-250 MA)');
  const [companyDesc, setCompanyDesc] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [selectedTool, setSelectedTool] = useState<ChangeToolId>('plan_kotter');
  
  // Dynamic Culture Questions State
  const [cultureQuestions, setCultureQuestions] = useState<AssessmentQuestion[]>([]);
  const [cultureAnswers, setCultureAnswers] = useState<Record<string, string>>({});
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [questionsGenerated, setQuestionsGenerated] = useState(false);

  // Step 2 State
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Step 3 State
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadExampleProject = () => {
    setScenario(DEMO_DATA.scenario);
    setCompanyDesc(DEMO_DATA.companyDesc);
    setCompanySize(DEMO_DATA.companySize);
    setCompanyUrl(DEMO_DATA.companyUrl);
    
    // Set Culture Context
    setCultureQuestions(DEMO_DATA.cultureQuestions);
    setCultureAnswers(DEMO_DATA.cultureAnswers);
    setQuestionsGenerated(true);

    // Set Tool Context
    setSelectedTool(DEMO_DATA.selectedTool);
    const qs = getAssessmentQuestions(DEMO_DATA.selectedTool);
    setQuestions(qs);
    // Ensure IDs match for demo data mapping (simple mapping for demo purposes)
    const demoToolAnswers: Record<string, string> = {};
    qs.forEach((q, index) => {
       // Map demo answers sequentially to the tool questions
       const keys = Object.keys(DEMO_DATA.toolAnswers);
       if (keys[index]) {
          // @ts-ignore
          demoToolAnswers[q.id] = DEMO_DATA.toolAnswers[keys[index]] || "Demo Antwort";
       }
    });
    setAnswers(demoToolAnswers);
  };

  const handleGenerateCultureQuestions = async () => {
    if (!scenario.trim() || !companyDesc.trim()) return;
    setGeneratingQuestions(true);
    try {
      const qs = await generateSystemicQuestions(scenario, companyDesc);
      setCultureQuestions(qs);
      setQuestionsGenerated(true);
    } catch (e) {
      console.error("Failed to generate questions");
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleStartAssessment = () => {
    if (!scenario.trim()) return;
    const qs = getAssessmentQuestions(selectedTool);
    setQuestions(qs);
    // Initialize answers if empty (or keep demo answers if present)
    setAnswers(prev => {
      const initAnswers: Record<string, string> = {};
      qs.forEach(q => {
        if (!prev[q.id]) initAnswers[q.id] = '';
        else initAnswers[q.id] = prev[q.id];
      });
      return initAnswers;
    });
    setStep('ASSESSMENT');
  };

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };
  
  const handleCultureAnswerChange = (id: string, value: string) => {
    setCultureAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    setStep('RESULT');

    // Format answers for API
    const formattedToolAnswers: AssessmentResponse[] = questions.map(q => ({
      questionId: q.id,
      questionText: q.text,
      answer: answers[q.id] || "Keine Angabe"
    }));

    const formattedCultureAnswers: AssessmentResponse[] = cultureQuestions.map(q => ({
      questionId: q.id,
      questionText: q.text,
      answer: cultureAnswers[q.id] || "Keine Angabe"
    }));

    try {
      const data = await generateChangeAnalysis(
        selectedTool, 
        scenario, 
        companySize, 
        companyDesc, 
        companyUrl, 
        formattedToolAnswers,
        formattedCultureAnswers
      );
      setResult(data);
    } catch (err) {
      setError('Entschuldigung, die AI konnte die Analyse gerade nicht erstellen. Bitte versuchen Sie es erneut.');
      setStep('ASSESSMENT'); // Go back on error
    } finally {
      setLoading(false);
    }
  };

  const handleResetFull = () => {
    setStep('SETUP');
    setResult(null);
    setScenario('');
    setCompanyDesc('');
    setCompanyUrl('');
    setAnswers({});
    setCultureAnswers({});
    setCultureQuestions([]);
    setQuestionsGenerated(false);
  };

  const handleNewAnalysisKeepContext = () => {
    setStep('ASSESSMENT'); // Go back to tool selection
    setResult(null);
    // We keep scenario, companyDesc, cultureAnswers, but maybe clear tool answers?
    // Let's keep tool answers in state but they will be overwritten if tool changes
  };

  const handlePrint = () => {
    window.print();
  };

  // Renderers for different Data Types (Same as before)
  const renderContent = () => {
    if (!result) return null;

    switch (result.toolId) {
      case 'plan_kotter':
        return (
          <div className="space-y-4">
            {result.data.map((step: any) => (
              <div key={step.step} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center mb-3">
                  <span className="bg-hs-blue text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 text-sm">
                    {step.step}
                  </span>
                  <h4 className="text-lg font-bold text-slate-800">{step.name}</h4>
                </div>
                <p className="text-slate-600 mb-3 italic">"{step.action}"</p>
                <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-500 border-l-2 border-hs-accent">
                  <span className="font-semibold text-hs-blue">Warum:</span> {step.rationale}
                </div>
              </div>
            ))}
          </div>
        );

      case 'story_creation':
        return (
           <div className="space-y-6">
              <p className="text-sm text-slate-500 mb-4 bg-blue-50 p-3 rounded border border-blue-100">
                <Brain size={16} className="inline mr-2"/>
                Die AI hat drei narrative Strategien für Sie entwickelt. Wählen Sie die Geschichte, die am besten zur aktuellen Kultur und Dringlichkeit passt.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {result.data.map((story: any, i: number) => {
                   let borderColor = 'border-slate-200';
                   let bgColor = 'bg-white';
                   let icon = <Brain size={24} />;
                   
                   if (story.style === 'Fight the Dragon') {
                     borderColor = 'border-red-200';
                     bgColor = 'bg-red-50/30';
                     icon = <ShieldAlert size={24} className="text-red-500" />;
                   } else if (story.style === 'Win the Princess') {
                     borderColor = 'border-emerald-200';
                     bgColor = 'bg-emerald-50/30';
                     icon = <Sparkles size={24} className="text-emerald-500" />;
                   } else {
                     borderColor = 'border-indigo-200';
                     bgColor = 'bg-indigo-50/30';
                     icon = <RefreshCw size={24} className="text-indigo-500" />;
                   }

                   return (
                     <div key={i} className={`p-6 rounded-xl border-2 ${borderColor} ${bgColor} flex flex-col`}>
                        <div className="flex items-center mb-4">
                           {icon}
                           <h4 className="font-bold text-slate-800 ml-2">{story.style}</h4>
                        </div>
                        <h5 className="font-bold text-lg text-hs-blue mb-3 leading-tight">"{story.headline}"</h5>
                        <p className="text-sm text-slate-600 italic mb-6 flex-grow">{story.narrative}</p>
                        
                        <div className="space-y-3 mt-auto">
                           <div className="bg-white p-3 rounded border border-slate-100">
                             <span className="text-xs font-bold text-slate-400 uppercase block">Kernbotschaft</span>
                             <p className="text-sm font-medium text-slate-800">{story.keyMessage}</p>
                           </div>
                           <div className="bg-white p-3 rounded border border-slate-100">
                             <span className="text-xs font-bold text-slate-400 uppercase block">Call to Action</span>
                             <p className="text-sm font-medium text-hs-accent">{story.callToAction}</p>
                           </div>
                        </div>
                     </div>
                   );
                 })}
              </div>
           </div>
        );

      case 'analysis_swot':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
              <h4 className="text-emerald-800 font-bold mb-4 flex items-center"><TrendingUp className="mr-2" size={18}/> Strengths</h4>
              <ul className="space-y-2">
                {result.data.strengths.map((item: string, i: number) => (
                  <li key={i} className="flex items-start text-sm text-emerald-900"><span className="mr-2">•</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 p-6 rounded-xl border border-red-100">
              <h4 className="text-red-800 font-bold mb-4 flex items-center"><AlertTriangle className="mr-2" size={18}/> Weaknesses</h4>
               <ul className="space-y-2">
                {result.data.weaknesses.map((item: string, i: number) => (
                  <li key={i} className="flex items-start text-sm text-red-900"><span className="mr-2">•</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h4 className="text-blue-800 font-bold mb-4 flex items-center"><Target className="mr-2" size={18}/> Opportunities</h4>
               <ul className="space-y-2">
                {result.data.opportunities.map((item: string, i: number) => (
                  <li key={i} className="flex items-start text-sm text-blue-900"><span className="mr-2">•</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
              <h4 className="text-amber-800 font-bold mb-4 flex items-center"><ShieldAlert className="mr-2" size={18}/> Threats</h4>
               <ul className="space-y-2">
                {result.data.threats.map((item: string, i: number) => (
                  <li key={i} className="flex items-start text-sm text-amber-900"><span className="mr-2">•</span>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        );

      case 'analysis_stakeholder':
        return (
          <div className="space-y-4">
             {result.data.map((sh: any, i: number) => (
               <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between">
                 <div className="mb-4 md:mb-0 md:w-1/3">
                   <h4 className="font-bold text-lg text-hs-blue">{sh.group}</h4>
                   <div className="flex space-x-2 mt-2">
                     <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600">Power: {sh.power}</span>
                     <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600">Interest: {sh.interest}</span>
                   </div>
                 </div>
                 <div className="md:w-2/3 md:pl-6 border-l border-slate-100">
                    <p className="text-sm font-semibold text-hs-accent mb-1">{sh.strategy}</p>
                    <p className="text-sm text-slate-600">{sh.tactics}</p>
                 </div>
               </div>
             ))}
          </div>
        );

      case 'analysis_gap':
      case 'risk_assessment':
        return (
           <div className="space-y-4">
            {result.data.map((item: any, i: number) => (
              <div key={i} className="bg-white p-5 rounded-lg border-l-4 border-hs-blue shadow-sm">
                 <h4 className="font-bold text-slate-800 mb-2">{item.area || item.riskArea}</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-red-50 p-3 rounded">
                      <span className="block font-bold text-red-700 text-xs uppercase mb-1">{item.current ? 'Ist-Zustand' : 'Auswirkung'}</span>
                      {item.current || item.impact}
                    </div>
                    <div className="bg-emerald-50 p-3 rounded">
                      <span className="block font-bold text-emerald-700 text-xs uppercase mb-1">{item.target ? 'Ziel-Zustand' : 'Mitigation'}</span>
                      {item.target || item.mitigation}
                    </div>
                 </div>
                 <div className="mt-3 text-sm text-slate-500">
                   <span className="font-semibold text-hs-blue">Aktion: </span>
                   {item.action || item.probability}
                 </div>
              </div>
            ))}
           </div>
        );
      
      case 'model_adkar':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-widest px-2">
              <span>Start</span>
              <span>Transformation</span>
              <span>Ziel</span>
            </div>
            <div className="relative pt-4 pb-4">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 transform -translate-y-1/2"></div>
              <div className="grid grid-cols-5 gap-2">
                 {result.data.map((stage: any, i: number) => (
                   <div key={i} className="flex flex-col items-center text-center group">
                      <div className="w-10 h-10 rounded-full bg-hs-blue text-white flex items-center justify-center font-bold text-sm mb-3 ring-4 ring-white shadow-lg z-10">
                        {stage.stage[0]}
                      </div>
                      <div className="bg-white p-3 rounded shadow border border-slate-100 text-xs w-full min-h-[100px] flex flex-col">
                        <span className="font-bold text-hs-blue mb-1">{stage.stage}</span>
                        <p className="text-slate-500 mb-2">{stage.status}</p>
                        <p className="text-hs-accent mt-auto font-medium">{stage.tactic}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        );

      case 'tool_culture_amp':
      case 'tool_qualtrics':
      case 'tool_viva':
        const isViva = result.toolId === 'tool_viva';
        const isQualtrics = result.toolId === 'tool_qualtrics';
        const accentColor = isViva ? 'border-purple-200' : isQualtrics ? 'border-sky-200' : 'border-rose-200';
        const bgAccent = isViva ? 'bg-purple-50' : isQualtrics ? 'bg-sky-50' : 'bg-rose-50';
        const textColor = isViva ? 'text-purple-800' : isQualtrics ? 'text-sky-800' : 'text-rose-800';

        return (
          <div className="space-y-6">
             <div className={`${bgAccent} p-4 rounded-lg border ${accentColor} mb-4`}>
                <p className={`text-sm ${textColor} font-medium`}>
                   <Sparkles size={16} className="inline mr-2" />
                   Einsatzstrategie & Analytics Plan
                </p>
             </div>
             <div className="grid grid-cols-1 gap-4">
                {result.data.map((item: any, i: number) => (
                   <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-lg text-hs-blue">{item.focusArea}</h4>
                        <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold text-slate-600 flex items-center">
                           <BarChart3 size={12} className="mr-2"/> Metric: {item.metric}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                         <div className="bg-slate-50 p-4 rounded-lg">
                            <span className="text-xs font-bold text-slate-400 uppercase block mb-2">AI Insight Prediction</span>
                            <p className="text-sm text-slate-700 italic">"{item.insight}"</p>
                         </div>
                         <div className={`${bgAccent} bg-opacity-30 p-4 rounded-lg`}>
                            <span className="text-xs font-bold text-slate-400 uppercase block mb-2">Empfohlene Intervention</span>
                            <p className={`text-sm ${textColor} font-medium`}>{item.intervention}</p>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        );

      default:
        return <p>Datenformat nicht unterstützt.</p>;
    }
  };

  return (
    <div className="pt-24 pb-12 min-h-screen bg-slate-50">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-full-width { width: 100% !important; max-width: none !important; margin: 0 !important; padding: 0 !important; }
          body { background: white; -webkit-print-color-adjust: exact; }
          @page { margin: 2cm; }
        }
      `}</style>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 print-full-width">
        
        <div className="mb-10 text-center no-print">
          <h1 className="text-4xl font-bold text-hs-blue mb-4">AI Change Consultant</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Ihr systemischer Begleiter für Transformationsprozesse.
          </p>
        </div>

        {/* Wizard Progress (Hidden on Print) */}
        <div className="flex justify-center mb-8 no-print">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step === 'SETUP' ? 'text-hs-accent' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'SETUP' ? 'border-hs-accent bg-hs-accent/10' : (step === 'ASSESSMENT' || step === 'RESULT') ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}>
                {(step === 'ASSESSMENT' || step === 'RESULT') ? <CheckCircle size={16}/> : '1'}
              </div>
              <span className="font-semibold text-sm">Kontext</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-200"></div>
            <div className={`flex items-center space-x-2 ${step === 'ASSESSMENT' ? 'text-hs-accent' : 'text-slate-400'}`}>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'ASSESSMENT' ? 'border-hs-accent bg-hs-accent/10' : step === 'RESULT' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300'}`}>
                {step === 'RESULT' ? <CheckCircle size={16}/> : '2'}
              </div>
              <span className="font-semibold text-sm">Tool & Details</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-200"></div>
            <div className={`flex items-center space-x-2 ${step === 'RESULT' ? 'text-hs-accent' : 'text-slate-400'}`}>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'RESULT' ? 'border-hs-accent bg-hs-accent/10' : 'border-slate-300'}`}>
                3
              </div>
              <span className="font-semibold text-sm">Lösung</span>
            </div>
          </div>
        </div>

        {/* View Switching */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* STEP 1: SETUP */}
          {step === 'SETUP' && (
            <div className="lg:col-span-12 max-w-5xl mx-auto w-full">
              
               {/* DEMO BUTTON */}
               <div className="flex justify-end mb-4">
                  <button 
                    onClick={loadExampleProject}
                    className="flex items-center text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm"
                  >
                    <PlayCircle size={16} className="mr-2" /> Beispiel-Szenario laden
                  </button>
               </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                   {/* Company Box */}
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                     <h2 className="text-lg font-bold text-hs-blue mb-4 flex items-center">
                       <Building className="mr-2 text-hs-accent" size={20}/> Unternehmensprofil
                     </h2>
                     <div className="space-y-4">
                       <div>
                         <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Webseite (URL)</label>
                         <div className="relative">
                            <input 
                              type="url"
                              placeholder="https://www.ihrefirma.de"
                              value={companyUrl}
                              onChange={(e) => setCompanyUrl(e.target.value)}
                              className="w-full pl-10 rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-hs-accent focus:border-transparent outline-none"
                            />
                            <Globe size={16} className="absolute left-3 top-3 text-slate-400" />
                         </div>
                       </div>
                       
                       <div>
                         <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Kurzbeschreibung & Kultur</label>
                         <textarea 
                            placeholder="Beschreiben Sie Branche, Produkte und vor allem die gelebte Kultur..."
                            value={companyDesc}
                            onChange={(e) => setCompanyDesc(e.target.value)}
                            className="w-full h-32 rounded-lg border-slate-300 border p-3 text-sm focus:ring-2 focus:ring-hs-accent focus:border-transparent outline-none resize-none mb-3"
                         />
                       </div>

                        <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Größe</label>
                        <select 
                          value={companySize} 
                          onChange={(e) => setCompanySize(e.target.value)}
                          className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-hs-accent focus:border-transparent outline-none bg-white"
                        >
                          <option>Start-up (1-50 MA)</option>
                          <option>Mittelstand (50-250 MA)</option>
                          <option>Großunternehmen (250+ MA)</option>
                          <option>Konzernstruktur</option>
                        </select>
                      </div>
                     </div>
                  </div>

                  {/* Scenario Box */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-hs-blue mb-4 flex items-center">
                      <FileText className="mr-2 text-hs-accent" size={20}/> Szenario definieren
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Veränderungsvorhaben</label>
                        <textarea 
                          value={scenario}
                          onChange={(e) => setScenario(e.target.value)}
                          placeholder="z.B. Einführung einer neuen ERP-Software gegen den Widerstand des Vertriebs..."
                          className="w-full h-32 rounded-lg border-slate-300 border p-3 text-sm focus:ring-2 focus:ring-hs-accent focus:border-transparent outline-none resize-none"
                        ></textarea>
                      </div>
                      
                      {/* Generate Button Area */}
                      {!questionsGenerated && (
                        <div className="pt-2">
                          <button
                            onClick={handleGenerateCultureQuestions}
                            disabled={!scenario.trim() || !companyDesc.trim() || generatingQuestions}
                            className={`w-full py-3 rounded-lg font-bold border-2 border-dashed flex items-center justify-center transition-all ${
                              (!scenario.trim() || !companyDesc.trim()) 
                                ? 'border-slate-200 text-slate-300 cursor-not-allowed' 
                                : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300'
                            }`}
                          >
                            {generatingQuestions ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              <>
                                <Sparkles size={18} className="mr-2" />
                                Systemische Reflexionsfragen generieren
                              </>
                            )}
                          </button>
                          <p className="text-xs text-center text-slate-400 mt-2">
                            Erforderlich für den nächsten Schritt
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Generated Questions OR Tool Selection Placeholder */}
                <div className="space-y-6">
                  {questionsGenerated ? (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 animate-fade-in relative">
                       <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-sm">
                         <Sparkles size={12} className="mr-1" /> Systemischer Deep-Dive
                       </div>
                       <div className="mt-4 space-y-6 max-h-[600px] overflow-y-auto pr-2">
                         {cultureQuestions.map((q, idx) => (
                           <div key={q.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                             <label className="block text-sm font-bold text-indigo-900 mb-2 leading-snug">
                               {idx + 1}. {q.text}
                             </label>
                             <textarea 
                               placeholder={q.placeholder}
                               value={cultureAnswers[q.id] || ''}
                               onChange={(e) => handleCultureAnswerChange(q.id, e.target.value)}
                               className="w-full h-20 rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none resize-none bg-white"
                             />
                           </div>
                         ))}
                       </div>
                       <div className="mt-6 flex justify-end">
                          <p className="text-xs text-slate-400 italic mr-4 self-center">Bitte beantworten Sie die Fragen.</p>
                          <button 
                            onClick={handleStartAssessment}
                            className="bg-hs-accent text-white px-6 py-2 rounded-lg font-bold hover:bg-sky-400 shadow-md flex items-center"
                          >
                             Weiter zur Tool-Auswahl <ArrowRight size={16} className="ml-2"/>
                          </button>
                       </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-8 rounded-2xl border-2 border-dashed border-slate-200 h-full flex flex-col items-center justify-center text-slate-400 text-center">
                      <MessageCircleQuestion size={48} className="mb-4 text-slate-300" />
                      <p className="font-medium">Definieren Sie erst Szenario und Profil,</p>
                      <p className="text-sm">um maßgeschneiderte Reflexionsfragen zu erhalten.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TOOL SELECTION & DETAIL ASSESSMENT */}
          {step === 'ASSESSMENT' && (
             <div className="lg:col-span-12 max-w-5xl mx-auto w-full animate-fade-in">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Sidebar: Tool Selection */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
                    <button onClick={() => setStep('SETUP')} className="text-slate-400 hover:text-hs-blue flex items-center text-sm mb-4">
                      <ChevronLeft size={16} className="mr-1"/> Zurück zum Kontext
                    </button>
                    <h2 className="text-lg font-bold text-hs-blue mb-4 flex items-center">
                      <Brain className="mr-2 text-hs-accent" size={20}/> Instrument wählen
                    </h2>
                    <div className="grid grid-cols-1 gap-2 max-h-[600px] overflow-y-auto">
                      {TOOLS.map((tool) => {
                        const Icon = tool.icon;
                        const isSelected = selectedTool === tool.id;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => {
                              setSelectedTool(tool.id);
                              // Trigger update of questions immediately when tool changes
                              setTimeout(() => {
                                const qs = getAssessmentQuestions(tool.id);
                                setQuestions(qs);
                                const initAnswers: Record<string, string> = {};
                                qs.forEach(q => initAnswers[q.id] = '');
                                setAnswers(initAnswers);
                              }, 0);
                            }}
                            className={`flex items-start text-left p-3 rounded-lg transition-all border ${
                              isSelected 
                                ? 'bg-hs-blue text-white border-hs-blue shadow-md transform scale-[1.02]' 
                                : 'bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100 hover:border-slate-200'
                            }`}
                          >
                            <Icon size={20} className={`mt-0.5 mr-3 flex-shrink-0 ${isSelected ? 'text-hs-accent' : 'text-slate-400'}`} />
                            <div>
                              <span className="block font-bold text-sm">{tool.name}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Main: Tool Specific Questions */}
                  <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                    <div className="mb-6 border-b border-slate-100 pb-4">
                      <h2 className="text-2xl font-bold text-hs-blue">Detail-Analyse: {TOOLS.find(t => t.id === selectedTool)?.name}</h2>
                      <p className="text-slate-500 text-sm mt-1">{TOOLS.find(t => t.id === selectedTool)?.description}</p>
                    </div>

                    <div className="space-y-6">
                      {questions.map((q, idx) => (
                        <div key={q.id}>
                          <label className="block text-sm font-bold text-slate-700 mb-2">
                            {idx + 1}. {q.text}
                          </label>
                          <textarea
                            value={answers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            placeholder={q.placeholder}
                            className="w-full h-24 rounded-lg border-slate-300 border p-3 text-sm focus:ring-2 focus:ring-hs-accent focus:border-transparent outline-none resize-none bg-slate-50 focus:bg-white transition-colors"
                          ></textarea>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                        <button 
                          onClick={handleGenerate}
                          className="bg-hs-accent text-white px-8 py-3 rounded-full font-bold hover:bg-sky-400 shadow-lg hover:shadow-xl flex items-center"
                        >
                          Finale Strategie generieren <Brain className="ml-2" size={18} />
                        </button>
                    </div>
                  </div>
               </div>
             </div>
          )}

          {/* STEP 3: RESULTS (Original Result View) */}
          {(step === 'RESULT' || loading) && (
            <div className="lg:col-span-12 animate-fade-in w-full">
               {loading && (
                  <div className="max-w-3xl mx-auto bg-white p-12 rounded-2xl shadow-sm text-center">
                    <Loader2 className="animate-spin mx-auto text-hs-accent mb-4" size={48} />
                    <h3 className="text-xl font-bold text-hs-blue mb-2">Die AI entwickelt Ihre Strategie...</h3>
                    <p className="text-slate-500">Wir kombinieren Ihre Kontext-Reflexion mit dem {TOOLS.find(t => t.id === selectedTool)?.name}.</p>
                  </div>
               )}

              {!loading && error && (
                <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl flex items-center mb-6">
                  <AlertTriangle className="mr-3" />
                  <div>
                    <p className="font-bold">Fehler bei der Analyse</p>
                    <p className="text-sm">{error}</p>
                    <button onClick={() => setStep('ASSESSMENT')} className="text-sm underline mt-2">Zurück zur Eingabe</button>
                  </div>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-6 max-w-5xl mx-auto">
                  
                  {/* Action Bar - Hidden on Print */}
                  <div className="flex justify-between items-center mb-6 no-print">
                    <div className="flex space-x-4">
                      <button onClick={handleNewAnalysisKeepContext} className="bg-white border border-slate-200 text-slate-600 hover:text-hs-blue hover:border-hs-blue px-4 py-2 rounded-lg shadow-sm flex items-center font-medium transition-all">
                        <ChevronLeft size={18} className="mr-1"/> Anderes Tool wählen (Kontext behalten)
                      </button>
                    </div>
                     <button onClick={handleResetFull} className="text-slate-400 hover:text-red-500 flex items-center text-sm font-medium">
                        <RefreshCw size={14} className="mr-1"/> Neues Projekt starten
                      </button>
                  </div>

                  {/* Header of Result */}
                  <div className="bg-white p-8 rounded-2xl border-b-4 border-hs-accent shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                          <span className="text-hs-accent font-bold uppercase tracking-wider text-xs mb-1 block">Ergebnisbericht</span>
                          <h2 className="text-3xl font-bold text-hs-blue">{TOOLS.find(t => t.id === result.toolId)?.name}</h2>
                      </div>
                      <div className="bg-slate-100 p-3 rounded-xl no-print">
                        <FileText size={32} className="text-slate-400" />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Executive Summary</h3>
                    <p className="text-slate-700 leading-relaxed text-lg">{result.summary}</p>
                  </div>

                  {/* Dynamic Content Body */}
                  <div className="bg-slate-50/50 rounded-2xl">
                    {renderContent()}
                  </div>

                  {/* Print / Download Area */}
                  <div className="flex justify-center pt-8 pb-12 no-print">
                    <button 
                      onClick={handlePrint}
                      className="bg-hs-blue text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-lg flex items-center"
                    >
                      <Printer size={18} className="mr-2" />
                      Ergebnis als PDF drucken / speichern
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
