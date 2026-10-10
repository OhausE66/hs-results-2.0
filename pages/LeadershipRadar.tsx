
import React, { useState, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, ReferenceLine
} from 'recharts';
import { Employee, ViewState } from '../types';
import { 
  Users, Activity, Sparkles, LayoutDashboard, 
  MessageSquare, Trash2, Plus, Edit, Brain, Heart, Loader2,
  ChevronLeft, ArrowRight, Target, Layers, Zap, CheckCircle, Search, TrendingUp, BarChart3, UserCheck, AlertCircle, Calendar, ClipboardCheck, Briefcase, FileText, ArrowRightLeft, X, Info, Save, MessageCircle, HelpCircle, ArrowDownCircle, Lightbulb, UserPlus, Settings, SaveAll, FileSearch, Database, RefreshCw
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Auth } from '../components/Auth';
import { AiWaiting } from '../components/AiWaiting';
import { ResultTeaser } from '../components/ResultTeaser';
import { saveProjectSession } from '../services/firebase';
import { generateContent } from '../services/geminiService';

const TEAM_SCENARIO = {
  title: "Transformation der Sales-Abteilung 2025",
  description: "Das Team befindet sich im Übergang von einem rein transaktionalen Verkauf hin zu einer beratungsorientierten Solution-Selling Strategie. Die Marktanforderungen steigen, während die internen Prozesse noch auf alten Hierarchien basieren. Ziel ist die Steigerung der Eigenverantwortung bei gleichzeitiger Entlastung der Führungsebene.",
  focus: "Resilienz, Digitale Kompetenz, Kollaboration"
};

const INITIAL_DATA: Employee[] = [
  { 
    id: 1, name: "Anna Müller", role: "Sales Lead", performance: 95, motivation: 60, workload: 92, department: "Sales", hbdiQuadrant: 'A',
    observations: {
      positive: ["Herausragende Abschlussquote bei Großkunden", "Exzellente Marktkenntnis", "Analytische Stärke bei Forecasts"],
      critical: ["Hohe Burnout-Gefahr durch Workload", "Vernachlässigt die Förderung von Junior-Talenten", "Kommuniziert oft zu direkt/harsch"]
    }
  },
  { 
    id: 2, name: "Ben Weber", role: "Senior Dev", performance: 92, motivation: 85, workload: 50, department: "IT", hbdiQuadrant: 'B',
    observations: {
      positive: ["Fehlerfreie Implementierung komplexer Logiken", "Strukturiert Arbeitsabläufe vorbildlich", "Hohe Zuverlässigkeit"],
      critical: ["Wenig Begeisterung für agile Experimente", "Sucht selten den Austausch mit anderen Abteilungen"]
    }
  },
  { 
    id: 3, name: "Carla Schmidt", role: "Support Manager", performance: 55, motivation: 45, workload: 85, department: "Support", hbdiQuadrant: 'C',
    observations: {
      positive: ["Hohe Empathie in schwierigen Kundenfällen", "Bindeglied innerhalb des Teams"],
      critical: ["Niedrige Fallabschlussquote", "Zögert bei technologischen Neuerungen", "Braucht sehr viel Bestätigung von außen"]
    }
  },
];

const DEMO_LEAD_PROFILE = {
  company: "InnovateTech Solutions GmbH",
  employeeCount: "450",
  position: "VP Engineering",
  spanOfControl: "12",
  challengeSketch: "Das Team wächst schnell, aber die agile Reife stagniert. Es gibt massive Spannungen zwischen der Produktentwicklung (Silo A) und dem Quality Engineering (Silo B). Ich verbringe 80% meiner Zeit mit operativem Feuerlöschen statt mit strategischer Personalentwicklung.",
  finalDecision: "Einführung von Cross-Functional Chapters und Empowerment der Lead-Engineers durch Coaching-Routinen.",
  reflectionAnswers: [
    "Den Erwartungen der Geschäftsführung nach sofortiger Feature-Delivery.",
    "Die Team-Produktivität würde kurzzeitig einbrechen, aber strukturelle Engpässe würden gnadenlos sichtbar.",
    "Meine Tendenz, bei Krisen sofort die Kontrolle zu übernehmen, statt das Team eigene Lösungen finden zu lassen.",
    "Das mittlere Management, da es durch die Silo-Strukturen seine Daseinsberechtigung legitimiert.",
    "Der unausgesprochene Konflikt zwischen Innovationsgeschwindigkeit und Qualitätsstabilität."
  ],
  questions: [
    "Wessen Erwartungen versuchen Sie am meisten zu erfüllen?",
    "Was würde passieren, wenn Sie das Problem eine Woche lang ignorieren?",
    "Welchen Anteil an der aktuellen Situation haben Ihre eigenen Routinen?",
    "Wer im Team profitiert heimlich davon, dass sich nichts ändern will?",
    "Welcher unausgesprochene Konflikt wird durch dieses Sachthema überlagert?"
  ]
};

const INSTRUMENT_TEMPLATES = {
  appraisal: {
    id: 'appraisal',
    title: "Mitarbeiterjahresgespräch",
    icon: Calendar,
    sections: [
      { h: "Rückblick & Erfolge", p: "Fokus auf die wichtigsten Meilensteine des letzten Jahres. Wo hat der Mitarbeiter einen Unterschied gemacht?" },
      { h: "Zusammenarbeit & Führung", p: "Offene Reflexion: Was braucht der Mitarbeiter von mir als Führungskraft, um noch wirksamer zu sein?" },
      { h: "Persönliche Entwicklung", p: "Welche Kompetenzen sollen im nächsten Jahr gezielt gestärkt werden? (Training/Coaching)" }
    ]
  },
  targets: {
    id: 'targets',
    title: "Zielvereinbarung",
    icon: Target,
    sections: [
      { h: "Hard Targets (KPIs)", p: "Messbare Ziele wie Umsatz, Ticket-Quote oder Projektabschlüsse. Zeitnah und SMART." },
      { h: "Soft Targets (Behavioral)", p: "Verhaltensziele basierend auf den beobachteten kritischen Punkten (z.B. Feedback-Kultur)." },
      { h: "Ressourcen-Commitment", p: "Welche Tools, Budgets oder Freiheiten stelle ich zur Verfügung?" }
    ]
  },
  delegation: {
    id: 'delegation',
    title: "Delegations-Framework",
    icon: ArrowRightLeft,
    sections: [
      { h: "Aufgaben-Kontext", p: "Warum ist diese Aufgabe wichtig für das große Ganze (Szenario)?" },
      { h: "Verantwortungsrahmen", p: "Darf der Mitarbeiter entscheiden (Empowerment) oder nur zuarbeiten (Assistenz)?" },
      { h: "Check-in Intervalle", p: "Festlegung von Terminen zur Abstimmung, um Micromanagement zu vermeiden." }
    ]
  },
  evaluation: {
    id: 'evaluation',
    title: "Leistungsbewertung",
    icon: ClipboardCheck,
    sections: [
      { h: "Fachliche Performance", p: "Bewertung der Arbeitsergebnisse gegen die vereinbarten Standards." },
      { h: "Systemischer Beitrag", p: "Wie wirkt der Mitarbeiter auf die Teamkultur und das Gesamtergebnis?" },
      { h: "Zukunfts-Potenzial", p: "Ist der Mitarbeiter bereit für mehr Verantwortung oder eine neue Rolle?" }
    ]
  }
};

type TabId = 'overview' | 'matrix' | 'profiles' | 'hbdi';
type OnboardingStep = 'LANDING' | 'CONTEXT' | 'CHALLENGE' | 'REFLECTION' | 'DECISION' | 'ANALYSIS' | 'DASHBOARD' | 'TEAM_SKETCH';

interface LeadershipRadarProps {
  user: any;
  setView: (v: ViewState) => void;
}

export const LeadershipRadar = ({ user, setView }: LeadershipRadarProps): React.ReactElement => {
  const { t, language } = useLanguage();
  const tr = (de: string, en: string) => language === 'de' ? de : en;
  const [step, setStep] = useState<OnboardingStep>('LANDING');
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [activeInstrument, setActiveInstrument] = useState<keyof typeof INSTRUMENT_TEMPLATES | null>(null);
  const [instrumentNotes, setInstrumentNotes] = useState<Record<string, string>>({});
  
  // Team Editor States
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);

  // Leadership Specific Context States
  const [leaderContext, setLeaderContext] = useState({
    company: '',
    employeeCount: '',
    position: '',
    spanOfControl: '',
    challengeSketch: '',
    finalDecision: '',
    chosenPath: ''
  });
  
  const [systemicQuestions, setSystemicQuestions] = useState<string[]>([]);
  const [reflectionAnswers, setReflectionAnswers] = useState<string[]>(['', '', '', '', '']);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [detailedAnalysis, setDetailedAnalysis] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const loadDemoProfile = () => {
    setLeaderContext({
      company: DEMO_LEAD_PROFILE.company,
      employeeCount: DEMO_LEAD_PROFILE.employeeCount,
      position: DEMO_LEAD_PROFILE.position,
      spanOfControl: DEMO_LEAD_PROFILE.spanOfControl,
      challengeSketch: DEMO_LEAD_PROFILE.challengeSketch,
      finalDecision: DEMO_LEAD_PROFILE.finalDecision,
      chosenPath: 'Struktur'
    });
    setSystemicQuestions(DEMO_LEAD_PROFILE.questions);
    setReflectionAnswers(DEMO_LEAD_PROFILE.reflectionAnswers);
    setStep('CHALLENGE');
  };

  const handleSaveProfile = async () => {
    if (!user) {
      alert("Bitte melden Sie sich an, um Ihr Profil im Vault zu speichern.");
      return;
    }
    if (apiError) return;
    setSaveStatus('saving');
    try {
      await saveProjectSession(user.uid, {
        title: `Führung: ${leaderContext.company || 'Unbenanntes Szenario'}`,
        toolId: 'leadership_radar',
        inputs: {
          context: leaderContext,
          reflectionAnswers,
          systemicQuestions,
          employees
        },
        results: detailedAnalysis || { summary: "Fortschritt gespeichert" },
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

  const generateSystemicQuestions = async () => {
    setApiError(null);
    setSystemicQuestions([]);
    setLoadingQuestions(true);
    setStep('REFLECTION');
    try {
      const prompt = `Du bist ein Senior Executive Coach. Basierend auf dieser Führungsherausforderung: "${leaderContext.challengeSketch}" im Kontext eines ${leaderContext.position} mit einer Führungsspanne von ${leaderContext.spanOfControl}, generiere genau 5 kurze, tiefgehende, paradoxe systemische Reflexionsfragen. Die Fragen sollen helfen, blinde Flecken in der Team-Dynamik und der eigenen Rolle aufzudecken. Antworte nur mit den Fragen als einfache liste, getrennt durch Zeilenumbrüche.`;
      
      const response = await generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      
      const questions = response.text?.split('\n').filter(q => q.trim().length > 5).slice(0, 5) || [];
      if (questions.length === 0) throw new Error('No questions returned');
      setSystemicQuestions(questions);
    } catch (e) {
      console.error(e);
      setApiError(tr('Die Coaching-Fragen konnten nicht erstellt werden. Bitte versuchen Sie es erneut.', 'The coaching questions could not be created. Please try again.'));
    } finally {
      setLoadingQuestions(false);
    }
  };

  const generateDetailedAnalysis = async (path: string) => {
    setApiError(null);
    setDetailedAnalysis(null);
    setLeaderContext(prev => ({ ...prev, chosenPath: path }));
    setStep('ANALYSIS');
    setLoadingAnalysis(true);
    try {
      const prompt = `Analysiere als Senior Management Consultant die folgende Führungssituation und erstelle einen ausführlichen Strategie-Bericht.
      UNTERNEHMEN: ${leaderContext.company}
      POSITION: ${leaderContext.position}
      HERAUSFORDERUNG: ${leaderContext.challengeSketch}
      ENTSCHEIDUNG: ${leaderContext.finalDecision}
      GEWÄHLTER WEG: ${path}
      REFLEXIONS-IMPULSE: ${reflectionAnswers.join(' | ')}
      
      Erstelle ein JSON mit folgender Struktur:
      {
        "management_summary": "Ausführliche Zusammenfassung",
        "strategic_levers": ["Hebel 1", "Hebel 2", "Hebel 3"],
        "cultural_risks": ["Risiko 1", "Risiko 2"],
        "impact_analysis": "Wie wird sich der gewählte Weg '${path}' auf die Team-Performance und Motivation auswirken?",
        "next_steps": ["Schritt 1", "Schritt 2", "Schritt 3"]
      }`;
      
      const response = await generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const analysis = JSON.parse(response.text || '{}');
      if (!analysis.management_summary || !Array.isArray(analysis.strategic_levers) || !Array.isArray(analysis.cultural_risks) || !analysis.impact_analysis || !Array.isArray(analysis.next_steps)) {
        throw new Error('Incomplete analysis returned');
      }
      setDetailedAnalysis(analysis);
    } catch (e) {
      console.error(e);
      setDetailedAnalysis(null);
      setApiError(tr('Die Führungsanalyse konnte nicht erstellt werden. Bitte versuchen Sie es erneut.', 'The leadership analysis could not be created. Please try again.'));
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleSaveEmployee = () => {
    if (!editingEmployee?.name) return;
    if (editingEmployee.id) {
      setEmployees(prev => prev.map(e => e.id === editingEmployee.id ? (editingEmployee as Employee) : e));
    } else {
      const newEmp = { ...editingEmployee, id: Date.now() } as Employee;
      setEmployees(prev => [...prev, newEmp]);
    }
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = (id: number) => {
    if (confirm("Mitarbeiter wirklich aus dem Radar entfernen?")) {
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  };

  const radarData = [
    { subject: 'Performance', A: employees.length > 0 ? employees.reduce((acc, e) => acc + (e.performance || 0), 0) / employees.length : 0, fullMark: 100 },
    { subject: 'Motivation', A: employees.length > 0 ? employees.reduce((acc, e) => acc + (e.motivation || 0), 0) / employees.length : 0, fullMark: 100 },
    { subject: 'Workload', A: employees.length > 0 ? employees.reduce((acc, e) => acc + (e.workload || 0), 0) / employees.length : 0, fullMark: 100 },
    { subject: 'Self-Org', A: 75, fullMark: 100 },
    { subject: 'Resilience', A: 68, fullMark: 100 },
  ];

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderLanding = () => (
    <div className="max-w-6xl mx-auto py-12 animate-fade-in px-4">
       <div className="flex flex-col lg:flex-row items-start gap-16 mb-24">
          <div className="lg:w-1/2 space-y-8">
             <div className="flex items-center space-x-4 mb-2">
                <div className="h-[3px] w-16 bg-hs-orange"></div>
                <p className="text-hs-orange font-black uppercase tracking-[0.3em] text-sm">{t('radar.subtitle')}</p>
             </div>
             <h1 className="text-6xl font-black text-hs-blue uppercase tracking-tight leading-[0.95]">
                {t('area.lead')}
             </h1>
             <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                <p className="font-bold text-hs-blue text-xl leading-snug">
                   {t('radar.landing.main')}
                </p>
                <div className="space-y-4">
                   <p className="font-bold text-hs-blue">
                      {t('radar.landing.text1')}
                   </p>
                   <ul className="space-y-2 ml-6">
                      {[1, 2, 3].map(i => (
                        <li key={i} className="flex items-center space-x-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-hs-orange shrink-0" />
                           <span className="text-sm font-medium">{t(`radar.landing.card${i}`)}</span>
                        </li>
                      ))}
                   </ul>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border-l-8 border-hs-orange shadow-sm">
                   <h4 className="font-black text-hs-blue uppercase text-xs tracking-widest mb-6 flex items-center">
                      <Target size={16} className="mr-2" /> {t('radar.landing.list_title')}
                   </h4>
                   <ul className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <li key={i} className="flex items-start space-x-3">
                           <CheckCircle size={18} className="text-hs-orange mt-0.5 shrink-0" />
                           <span className="text-sm font-bold text-hs-blue leading-relaxed">{t(`radar.landing.item${i}`)}</span>
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
             <div className="pt-8">
                <button 
                  onClick={() => setStep('CONTEXT')}
                  className="bg-hs-blue text-white px-10 py-5 rounded-full font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-xl hover:-translate-y-1 flex items-center group"
                >
                  Individuelles Setup starten
                  <ArrowRight size={20} className="ml-3 group-hover:translate-x-2 transition-transform" />
                </button>
             </div>
          </div>
          <div className="lg:w-1/2 sticky top-24">
             <div className="relative group">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200" className="rounded-[3rem] shadow-2xl z-10 relative" alt="Leadership Dialogue" />
                <div className="absolute -bottom-8 -right-8 w-full h-full border-4 border-hs-orange/30 rounded-[3rem] -z-10"></div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderContextForm = () => (
    <div className="max-w-4xl mx-auto py-12 animate-fade-in px-4">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 relative">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h2 className="text-3xl font-black text-hs-blue uppercase mb-2 flex items-center">
              <Briefcase className="mr-3 text-hs-orange" /> Führungskontext
            </h2>
            <p className="text-slate-500 uppercase text-[10px] font-black tracking-widest">Schritt 1: Rahmenbedingungen klären</p>
          </div>
          <button 
            onClick={loadDemoProfile}
            className="flex items-center space-x-2 text-xs font-black uppercase text-hs-accent hover:text-hs-orange transition-colors bg-slate-50 px-5 py-3 rounded-full border border-slate-100 shadow-sm"
          >
            <Sparkles size={16} />
            <span>Beispiel laden</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Unternehmen / Organisation</label>
            <input 
              type="text" 
              value={leaderContext.company}
              onChange={e => setLeaderContext({...leaderContext, company: e.target.value})}
              className="w-full p-5 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-hs-orange/20"
              placeholder="z.B. HS-Logistics GmbH"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Anzahl Mitarbeiter (Gesamt)</label>
            <input 
              type="number" 
              value={leaderContext.employeeCount}
              onChange={e => setLeaderContext({...leaderContext, employeeCount: e.target.value})}
              className="w-full p-5 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-hs-orange/20"
              placeholder="z.B. 150"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Ihre Position / Rolle</label>
            <input 
              type="text" 
              value={leaderContext.position}
              onChange={e => setLeaderContext({...leaderContext, position: e.target.value})}
              className="w-full p-5 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-hs-orange/20"
              placeholder="z.B. Abteilungsleitung Operations"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Führungsspanne (Direkte Reports)</label>
            <input 
              type="number" 
              value={leaderContext.spanOfControl}
              onChange={e => setLeaderContext({...leaderContext, spanOfControl: e.target.value})}
              className="w-full p-5 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-2 focus:ring-hs-orange/20"
              placeholder="z.B. 8"
            />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <button 
            onClick={() => setStep('CHALLENGE')}
            disabled={!leaderContext.company || !leaderContext.position}
            className="flex-grow py-5 bg-hs-blue text-white rounded-3xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-xl disabled:opacity-30 flex items-center justify-center group"
          >
            Herausforderungen skizzieren <ArrowRight size={20} className="ml-3 group-hover:translate-x-2 transition-transform" />
          </button>
          <button 
            onClick={() => setStep('TEAM_SKETCH')}
            disabled={!leaderContext.company || !leaderContext.position}
            className="flex-grow py-5 bg-white border-2 border-hs-blue text-hs-blue rounded-3xl font-black uppercase tracking-widest hover:bg-hs-blue hover:text-white transition-all shadow-md disabled:opacity-30 flex items-center justify-center group"
          >
            Mein Team führen <Users size={20} className="ml-3 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderTeamSketch = () => (
    <div className="max-w-6xl mx-auto py-12 animate-fade-in px-4">
      <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-black text-hs-blue uppercase mb-2 flex items-center">
              <Users className="mr-3 text-hs-orange" /> Mein Team skizzieren
            </h2>
            <p className="text-slate-500 uppercase text-[10px] font-black tracking-widest">Einzelne Personen erfassen und bewerten</p>
          </div>
          <button 
            onClick={() => setEditingEmployee({ name: '', role: '', performance: 70, motivation: 70, workload: 50, department: leaderContext.company || 'Team', hbdiQuadrant: 'A', observations: { positive: [], critical: [] } })}
            className="bg-hs-orange text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-hs-blue transition-all flex items-center"
          >
            <UserPlus size={18} className="mr-2" /> Person hinzufügen
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {employees.map(e => (
            <div key={e.id} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 relative group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-hs-blue text-white rounded-xl flex items-center justify-center">
                  <UserCheck size={24} />
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setEditingEmployee(e)} className="p-2 text-hs-blue hover:bg-white rounded-lg transition-colors"><Edit size={16}/></button>
                  <button onClick={() => handleDeleteEmployee(e.id)} className="p-2 text-red-400 hover:bg-white rounded-lg transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
              <h4 className="text-xl font-black text-hs-blue uppercase mb-1">{e.name}</h4>
              <p className="text-[10px] text-hs-accent font-black uppercase tracking-widest mb-6">{e.role}</p>
              
              <div className="space-y-4">
                <div>
                   <div className="flex justify-between text-[8px] font-black uppercase text-slate-400 mb-1"><span>Performance</span><span>{e.performance}%</span></div>
                   <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${e.performance}%` }} />
                   </div>
                </div>
                <div>
                   <div className="flex justify-between text-[8px] font-black uppercase text-slate-400 mb-1"><span>Motivation</span><span>{e.motivation}%</span></div>
                   <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div className="bg-hs-orange h-full rounded-full" style={{ width: `${e.motivation}%` }} />
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setStep('CONTEXT')}
            className="flex-1 py-5 border-2 border-slate-100 text-slate-400 rounded-3xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Zurück zum Kontext
          </button>
          <button 
            onClick={() => setStep('DASHBOARD')}
            className="flex-[2] py-5 bg-hs-blue text-white rounded-3xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-xl flex items-center justify-center group"
          >
            Team-Dashboard öffnen <ArrowRight size={20} className="ml-3 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
      
      {editingEmployee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10">
              <h3 className="text-2xl font-black text-hs-blue uppercase mb-8">{editingEmployee.id ? 'Mitarbeiter bearbeiten' : 'Person hinzufügen'}</h3>
              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Name</label>
                    <input value={editingEmployee.name} onChange={e => setEditingEmployee({...editingEmployee, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-hs-blue/20" placeholder="Name..." />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rolle</label>
                    <input value={editingEmployee.role} onChange={e => setEditingEmployee({...editingEmployee, role: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-2 focus:ring-hs-blue/20" placeholder="Rolle..." />
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                       <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1"><span>Performance</span><span>{editingEmployee.performance}%</span></div>
                       <input type="range" min="0" max="100" value={editingEmployee.performance} onChange={e => setEditingEmployee({...editingEmployee, performance: parseInt(e.target.value)})} className="w-full accent-hs-blue" />
                    </div>
                    <div>
                       <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1"><span>Motivation</span><span>{editingEmployee.motivation}%</span></div>
                       <input type="range" min="0" max="100" value={editingEmployee.motivation} onChange={e => setEditingEmployee({...editingEmployee, motivation: parseInt(e.target.value)})} className="w-full accent-hs-orange" />
                    </div>
                 </div>
                 <div className="flex justify-end space-x-3 pt-6">
                    <button onClick={() => setEditingEmployee(null)} className="px-6 py-3 rounded-xl font-bold uppercase text-xs text-slate-400">Abbrechen</button>
                    <button onClick={handleSaveEmployee} className="px-10 py-3 bg-hs-blue text-white rounded-xl font-black uppercase text-xs shadow-lg hover:bg-hs-orange transition-all">Speichern</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );

  const renderChallengeSketch = () => (
    <div className="max-w-4xl mx-auto py-12 animate-fade-in px-4">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100">
        <div className="flex justify-between items-start mb-2">
           <div className="flex items-center space-x-3">
              <HelpCircle className="text-hs-orange" />
              <h2 className="text-3xl font-black text-hs-blue uppercase">Führungsherausforderungen</h2>
           </div>
           <button 
             onClick={handleSaveProfile}
             disabled={saveStatus !== 'idle'}
             className={`flex items-center space-x-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${saveStatus === 'saved' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:text-hs-blue'}`}
           >
              {saveStatus === 'saving' ? <Loader2 size={12} className="animate-spin" /> : saveStatus === 'saved' ? <CheckCircle size={12} /> : <Save size={12} />}
              <span>Profil speichern</span>
           </button>
        </div>
        <p className="text-slate-500 mb-10 uppercase text-[10px] font-black tracking-widest">Schritt 2: Aktuelle Situation skizzieren</p>
        
        <div className="space-y-6 mb-10">
          <p className="text-slate-600 leading-relaxed font-medium">
            Beschreiben Sie kurz Ihre aktuell größten Herausforderungen. Geht es um Team-Dynamiken, strukturelle Engpässe oder Ihre eigene Führungsrolle?
          </p>
          <textarea 
            value={leaderContext.challengeSketch}
            onChange={e => setLeaderContext({...leaderContext, challengeSketch: e.target.value})}
            className="w-full h-64 p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] outline-none focus:border-hs-orange transition-all text-lg shadow-inner resize-none"
            placeholder="z.B. Das Team ist fachlich exzellent, aber es herrscht Silo-Denken. Ich fühle mich oft im Mikromanagement gefangen und habe zu wenig Zeit für Strategie..."
          />
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setStep('CONTEXT')}
            className="flex-1 py-5 border-2 border-slate-100 text-slate-400 rounded-3xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Zurück
          </button>
          <button 
            onClick={generateSystemicQuestions}
            disabled={leaderContext.challengeSketch.length < 20}
            className="flex-[2] py-5 bg-hs-blue text-white rounded-3xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-xl disabled:opacity-30 flex items-center justify-center group"
          >
            Systemische Reflexion <Sparkles size={20} className="ml-3 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderReflection = () => (
    <div className="max-w-4xl mx-auto py-12 animate-fade-in px-4">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-3xl font-black text-hs-blue uppercase flex items-center">
            <Brain className="mr-3 text-hs-accent" /> Systemische Reflexion
          </h2>
          <button 
            onClick={handleSaveProfile}
            disabled={saveStatus !== 'idle'}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${saveStatus === 'saved' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:text-hs-blue'}`}
          >
            {saveStatus === 'saving' ? <Loader2 size={12} className="animate-spin" /> : saveStatus === 'saved' ? <CheckCircle size={12} /> : <Save size={12} />}
            <span>Profil speichern</span>
          </button>
        </div>
        <p className="text-slate-500 mb-10 uppercase text-[10px] font-black tracking-widest">Schritt 3: Den Kern freilegen</p>
        
        {loadingQuestions ? (
          <AiWaiting
            messages={language === 'de' ? [
              'Ihre Führungssituation wird eingeordnet …',
              'Systemische Coaching-Fragen werden entwickelt …',
              'Blinde Flecken und Muster werden herausgearbeitet …'
            ] : [
              'Mapping your leadership situation …',
              'Developing systemic coaching questions …',
              'Surfacing blind spots and patterns …'
            ]}
            hint={tr('Die Fragen sind meist nach 15–30 Sekunden bereit.', 'The questions are usually ready within 15–30 seconds.')}
          />
        ) : apiError ? (
          <div className="max-w-2xl mx-auto py-12 text-center" role="alert">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-red-100">
              <AlertCircle size={56} className="mx-auto text-red-500 mb-6" />
              <h3 className="text-2xl font-black text-hs-blue uppercase mb-4">{tr('Die KI konnte nicht antworten.', 'The AI could not respond.')}</h3>
              <p className="text-slate-500 mb-8">{apiError}</p>
              <button onClick={generateSystemicQuestions} className="bg-hs-blue text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-xl">
                <RefreshCw size={16} className="inline mr-2" />{tr('Erneut versuchen', 'Try again')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {systemicQuestions.map((q, idx) => (
              <div key={idx} className="space-y-4 animate-fade-in" style={{ animationDelay: `${idx * 200}ms` }}>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-hs-accent text-white flex items-center justify-center font-black shrink-0 mt-1">{idx + 1}</div>
                  <h3 className="text-xl font-bold text-hs-blue leading-tight">{q}</h3>
                </div>
                <textarea 
                  value={reflectionAnswers[idx]}
                  onChange={e => {
                    const newAnswers = [...reflectionAnswers];
                    newAnswers[idx] = e.target.value;
                    setReflectionAnswers(newAnswers);
                  }}
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-hs-accent transition-all text-sm italic"
                  placeholder="Ihre Gedanken dazu..."
                />
              </div>
            ))}
            
            <button 
              onClick={() => setStep('DECISION')}
              className="w-full py-5 bg-hs-blue text-white rounded-3xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-xl flex items-center justify-center group"
            >
              Zur Entscheidung gelangen <ArrowDownCircle size={20} className="ml-3 group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderDecision = () => (
    <div className="max-w-4xl mx-auto py-12 animate-fade-in px-4">
      <div className="bg-white p-12 rounded-[4rem] shadow-2xl border-t-[16px] border-hs-orange relative">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-4xl font-black text-hs-blue uppercase">Die Entscheidung</h2>
          <button 
            onClick={handleSaveProfile}
            disabled={saveStatus !== 'idle'}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${saveStatus === 'saved' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:text-hs-blue'}`}
          >
            {saveStatus === 'saving' ? <Loader2 size={12} className="animate-spin" /> : saveStatus === 'saved' ? <CheckCircle size={12} /> : <Save size={12} />}
            <span>Profil speichern</span>
          </button>
        </div>
        <p className="text-slate-500 mb-10 uppercase text-[10px] font-black tracking-widest">Schritt 4: Was will ich verändern?</p>
        
        <div className="space-y-8 mb-12">
           <p className="text-lg text-slate-600 font-bold italic border-l-4 border-hs-accent pl-6 py-2 bg-slate-50 rounded-r-2xl">
             "Nach dieser Reflexion ist mir klargeworden, dass die wichtigste Veränderung folgende ist..."
           </p>
           <textarea 
             value={leaderContext.finalDecision}
             onChange={e => setLeaderContext({...leaderContext, finalDecision: e.target.value})}
             className="w-full h-40 p-8 bg-white border-4 border-slate-100 rounded-[2.5rem] outline-none focus:border-hs-orange transition-all text-xl font-black text-hs-blue shadow-lg"
             placeholder="Formulieren Sie Ihr Veränderungsziel..."
           />
        </div>

        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Alternative Wege zur Umsetzung</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <button 
             onClick={() => generateDetailedAnalysis('Struktur')}
             className="p-6 rounded-3xl border-2 transition-all text-center group border-transparent bg-slate-50 hover:border-hs-blue hover:bg-white"
           >
              <LayoutDashboard size={32} className="mx-auto mb-4 text-hs-blue group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-black uppercase mb-1">Struktur</p>
              <p className="text-xs font-bold text-slate-500">Optimierung der Rollen & Dashboards</p>
           </button>
           <button 
             onClick={() => generateDetailedAnalysis('Kultur')}
             className="p-6 rounded-3xl border-2 transition-all text-center group border-transparent bg-slate-50 hover:border-hs-orange hover:bg-white"
           >
              <Users size={32} className="mx-auto mb-4 text-hs-orange group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-black uppercase mb-1">Kultur</p>
              <p className="text-xs font-bold text-slate-500">Dialog-Formate & Team-Spirit</p>
           </button>
           <button 
             onClick={() => generateDetailedAnalysis('Kompetenz')}
             className="p-6 rounded-3xl border-2 transition-all text-center group border-transparent bg-slate-50 hover:border-hs-accent hover:bg-white"
           >
              <Zap size={32} className="mx-auto mb-4 text-hs-accent group-hover:scale-110 transition-transform" />
              <p className="text-[10px] font-black uppercase mb-1">Kompetenz</p>
              <p className="text-xs font-bold text-slate-500">Training der Führungsinstrumente</p>
           </button>
        </div>
      </div>
    </div>
  );

  const renderAnalysis = () => {
    if (loadingAnalysis) {
      return (
        <AiWaiting
          messages={language === 'de' ? [
            'Ihre Reflexion wird verdichtet …',
            'Führungshebel und Risiken werden abgeleitet …',
            'Ihr persönlicher Analysebericht wird aufgebaut …'
          ] : [
            'Consolidating your reflection …',
            'Deriving leadership levers and risks …',
            'Building your personal analysis report …'
          ]}
          hint={tr('Der Analysebericht ist meist nach 20–40 Sekunden bereit.', 'The analysis report is usually ready within 20–40 seconds.')}
        />
      );
    }

    if (apiError) {
      return (
        <div className="max-w-2xl mx-auto py-20 text-center px-4" role="alert">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-red-100">
            <AlertCircle size={64} className="mx-auto text-red-500 mb-6" />
            <h2 className="text-2xl font-black text-hs-blue uppercase mb-4">{tr('Die Analyse konnte nicht erstellt werden.', 'The analysis could not be created.')}</h2>
            <p className="text-slate-500 mb-8">{apiError}</p>
            <button onClick={() => generateDetailedAnalysis(leaderContext.chosenPath)} className="bg-hs-blue text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-xl">
              <RefreshCw size={16} className="inline mr-2" />{tr('Erneut versuchen', 'Try again')}
            </button>
          </div>
        </div>
      );
    }

    if (!detailedAnalysis) return null;

    if (!user) {
      return (
        <ResultTeaser
          title={tr('Ihre Führungsanalyse ist fertig', 'Your leadership analysis is ready')}
          lead={detailedAnalysis.management_summary}
          locked={[
            tr('Strategische Führungshebel für Ihren gewählten Weg', 'Strategic leadership levers for your chosen path'),
            tr('Kulturelle Risiken und mögliche Nebenwirkungen', 'Cultural risks and possible side effects'),
            tr('Impact-Prognose für Team-Performance und Motivation', 'Impact forecast for team performance and motivation'),
            tr('Konkrete nächste Schritte für die Umsetzung', 'Concrete next steps for implementation')
          ]}
        />
      );
    }

    return (
      <div className="max-w-6xl mx-auto py-12 animate-fade-in space-y-12 px-4">
         <div className="bg-hs-blue text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10"><FileSearch size={240} /></div>
            <div className="relative z-10">
               <div className="flex justify-between items-start mb-8">
                  <div className="bg-hs-orange px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest w-fit">Executive Summary</div>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={saveStatus !== 'idle'}
                    className={`flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${saveStatus === 'saved' ? 'bg-emerald-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}
                  >
                    {saveStatus === 'saving' ? <Loader2 size={14} className="animate-spin" /> : saveStatus === 'saved' ? <CheckCircle size={14} /> : <Save size={14} />}
                    <span>{saveStatus === 'saved' ? 'Bericht gesichert' : 'Strategie speichern'}</span>
                  </button>
               </div>
               <h1 className="text-5xl font-black uppercase tracking-tight mb-8 leading-none">Führungs-Analyse: {leaderContext.chosenPath}</h1>
               <p className="text-2xl text-slate-300 font-bold max-w-4xl leading-relaxed italic">"{detailedAnalysis.management_summary}"</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border-l-8 border-hs-accent">
               <h3 className="text-xl font-black text-hs-blue uppercase mb-6 flex items-center"><Target className="mr-3 text-hs-accent" /> Strategische Hebel</h3>
               <ul className="space-y-4">
                  {detailedAnalysis.strategic_levers.map((l: string, i: number) => (
                    <li key={i} className="flex items-start text-slate-700 font-bold bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <CheckCircle size={18} className="text-emerald-500 mr-3 mt-1 flex-shrink-0" /> {l}
                    </li>
                  ))}
               </ul>
            </div>
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border-l-8 border-hs-orange">
               <h3 className="text-xl font-black text-hs-blue uppercase mb-6 flex items-center"><AlertCircle className="mr-3 text-hs-orange" /> Kulturelle Risiken</h3>
               <ul className="space-y-4">
                  {detailedAnalysis.cultural_risks.map((r: string, i: number) => (
                    <li key={i} className="flex items-start text-slate-700 font-bold bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <AlertCircle size={18} className="text-hs-orange mr-3 mt-1 flex-shrink-0" /> {r}
                    </li>
                  ))}
               </ul>
            </div>
         </div>

         <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-10 -left-10 text-white/5"><TrendingUp size={240} /></div>
            <h3 className="text-2xl font-black uppercase mb-8 tracking-widest text-hs-accent">Impact Prognose</h3>
            <p className="text-xl leading-relaxed text-slate-300 font-medium">{detailedAnalysis.impact_analysis}</p>
            
            <div className="mt-12 pt-10 border-t border-white/10">
               <h4 className="text-sm font-black uppercase tracking-widest mb-6">Empfohlene nächste Schritte</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {detailedAnalysis.next_steps.map((s: string, i: number) => (
                    <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/10">
                       <span className="text-hs-orange font-black text-2xl mb-2 block">{i + 1}</span>
                       <p className="text-sm font-bold">{s}</p>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <button 
           onClick={() => setStep('DASHBOARD')}
           className="w-full bg-hs-blue text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-hs-orange transition-all flex items-center justify-center group"
         >
            Zum operativen Führungs-Dashboard <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform" />
         </button>
      </div>
    );
  };

  const renderTeamEditor = () => {
    if (!isEditingTeam) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
        <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl p-10 relative">
          <button onClick={() => setIsEditingTeam(false)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
          <h2 className="text-3xl font-black text-hs-blue uppercase mb-2 flex items-center"><Settings className="mr-3 text-hs-orange" /> Team-Zusammensetzung</h2>
          <p className="text-slate-400 uppercase text-[10px] font-black tracking-widest mb-10">Mitarbeiterprofile pflegen und aufstellen</p>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map(e => (
                <div key={e.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between group">
                  <div>
                    <p className="font-bold text-hs-blue">{e.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">{e.role}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => setEditingEmployee(e)} className="p-2 text-hs-blue hover:bg-white rounded-lg transition-colors"><Edit size={16}/></button>
                    <button onClick={() => handleDeleteEmployee(e.id)} className="p-2 text-red-400 hover:bg-white rounded-lg transition-colors"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setEditingEmployee({ name: '', role: '', performance: 70, motivation: 70, workload: 50, department: leaderContext.company || 'Team', hbdiQuadrant: 'A', observations: { positive: [], critical: [] } })}
                className="p-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-hs-blue hover:text-hs-blue transition-all group"
              >
                <UserPlus size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Hinzufügen</span>
              </button>
            </div>
          </div>
          
          {editingEmployee && (
             <div className="mt-10 pt-10 border-t border-slate-100 animate-fade-in">
                <h3 className="font-black text-hs-blue uppercase text-sm mb-6">{editingEmployee.id ? 'Profil bearbeiten' : 'Neues Profil anlegen'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <input value={editingEmployee.name} onChange={e => setEditingEmployee({...editingEmployee, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Name..." />
                    <input value={editingEmployee.role} onChange={e => setEditingEmployee({...editingEmployee, role: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="Rolle..." />
                    <select value={editingEmployee.hbdiQuadrant} onChange={e => setEditingEmployee({...editingEmployee, hbdiQuadrant: e.target.value as any})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                      <option value="A">HBDI Quadrant A (Rational)</option>
                      <option value="B">HBDI Quadrant B (Organisatorisch)</option>
                      <option value="C">HBDI Quadrant C (Emotional)</option>
                      <option value="D">HBDI Quadrant D (Konzeptionell)</option>
                    </select>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1"><span>Performance</span><span>{editingEmployee.performance}%</span></div>
                      <input type="range" min="0" max="100" value={editingEmployee.performance} onChange={e => setEditingEmployee({...editingEmployee, performance: parseInt(e.target.value)})} className="w-full accent-hs-blue" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1"><span>Motivation</span><span>{editingEmployee.motivation}%</span></div>
                      <input type="range" min="0" max="100" value={editingEmployee.motivation} onChange={e => setEditingEmployee({...editingEmployee, motivation: parseInt(e.target.value)})} className="w-full accent-hs-orange" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                   <button onClick={() => setEditingEmployee(null)} className="px-6 py-3 rounded-xl font-bold uppercase text-xs text-slate-400">Abbrechen</button>
                   <button onClick={handleSaveEmployee} className="px-10 py-3 bg-hs-blue text-white rounded-xl font-black uppercase text-xs shadow-lg hover:bg-hs-orange transition-all">Speichern</button>
                </div>
             </div>
          )}
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-10 animate-fade-in">
       <div className="bg-hs-blue text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Zap className="text-hs-orange" size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-hs-accent">Individuelles Führungs-Profil</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={saveStatus !== 'idle'}
                    className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center border ${saveStatus === 'saved' ? 'bg-emerald-50 border-emerald-500' : 'bg-white/10 hover:bg-white/20 border-white/10'}`}
                  >
                     {saveStatus === 'saving' ? <Loader2 size={12} className="animate-spin" /> : saveStatus === 'saved' ? <CheckCircle size={12} /> : <Save size={12} />}
                     <span className="ml-2">{saveStatus === 'saved' ? 'Gespeichert' : 'Vault Sicherung'}</span>
                  </button>
                  <button 
                    onClick={() => setIsEditingTeam(true)}
                    className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center border border-white/10"
                  >
                    <Settings size={14} className="mr-2" /> Team aufstellen
                  </button>
                </div>
             </div>
             <h2 className="text-3xl font-black uppercase mb-2 tracking-tight">{leaderContext.company || TEAM_SCENARIO.title}</h2>
             <p className="text-sm font-bold text-hs-accent uppercase tracking-widest mb-4">{leaderContext.position} • Pfad: {leaderContext.chosenPath || 'Standard'}</p>
             <p className="text-lg text-slate-300 max-w-4xl leading-relaxed italic">"{leaderContext.finalDecision || leaderContext.challengeSketch || TEAM_SCENARIO.description}"</p>
             <div className="mt-8 flex items-center space-x-8">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Strategischer Fokus</p>
                   <p className="text-sm font-bold text-white">Transformation & Wirksamkeit</p>
                </div>
                <div className="h-10 w-[1px] bg-white/10" />
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Team-Audit</p>
                   <p className="text-sm font-bold text-white">{employees.length} Profile analysiert</p>
                </div>
             </div>
          </div>
          <Users className="absolute -bottom-10 -right-10 text-white/5" size={240} />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center">
             <h3 className="text-xl font-black text-hs-blue uppercase mb-8 flex items-center self-start">
                <LayoutDashboard className="mr-3 text-hs-orange" /> Team Dynamik Radar
             </h3>
             <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                   <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#f1f5f9" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="Team Average"
                        dataKey="A"
                        stroke="#1a2b4b"
                        fill="#1a2b4b"
                        fillOpacity={0.1}
                      />
                   </RadarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-8 rounded-[2.5rem] shadow-md border-l-8 border-emerald-500 flex flex-col justify-between">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Performance Avg</p>
                <p className="text-5xl font-black text-hs-blue">{Math.round(radarData[0].A)}%</p>
                <div className="flex items-center text-emerald-600 text-xs font-bold mt-2">
                   <TrendingUp size={14} className="mr-1" /> Aktiv gesteuert
                </div>
             </div>
             <div className="bg-white p-8 rounded-[2.5rem] shadow-md border-l-8 border-hs-orange flex flex-col justify-between">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Motivation Avg</p>
                <p className="text-5xl font-black text-hs-blue">{Math.round(radarData[1].A)}%</p>
                <div className="flex items-center text-hs-orange text-xs font-bold mt-2">
                   <Activity size={14} className="mr-1" /> Stabilisierend
                </div>
             </div>
             <div className="col-span-full bg-slate-50 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verfügbare Instrumente</h4>
                <div className="grid grid-cols-2 gap-3">
                   {Object.values(INSTRUMENT_TEMPLATES).map((inst, i) => (
                      <div key={i} className="flex items-center space-x-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                         <inst.icon size={16} className="text-hs-accent" />
                         <span className="text-[10px] font-bold text-hs-blue uppercase">{inst.title}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </div>
  );

  const renderMatrix = () => (
    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 animate-fade-in">
       <h3 className="text-xl font-black text-hs-blue uppercase mb-8 flex items-center">
          <BarChart3 className="mr-3 text-hs-accent" /> Performance-Motivation Matrix
       </h3>
       <div className="w-full h-[500px] relative">
          <ResponsiveContainer width="100%" height="100%">
             <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis type="number" dataKey="performance" name="Performance" unit="%" domain={[0, 100]} hide />
                <YAxis type="number" dataKey="motivation" name="Motivation" unit="%" domain={[0, 100]} hide />
                <ZAxis type="category" dataKey="name" name="Name" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <ReferenceLine x={50} stroke="#f1f5f9" strokeWidth={2} />
                <ReferenceLine y={50} stroke="#f1f5f9" strokeWidth={2} />
                <Scatter name="Employees" data={employees}>
                   {employees.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.performance > 50 && entry.motivation > 50 ? '#10b981' : entry.performance > 50 ? '#3b82f6' : '#f97316'} />
                   ))}
                </Scatter>
             </ScatterChart>
          </ResponsiveContainer>
          <div className="absolute top-0 left-0 text-[10px] font-black uppercase text-slate-300">Hohe Motivation</div>
          <div className="absolute bottom-0 left-0 text-[10px] font-black uppercase text-slate-300">Niedrige Motivation</div>
          <div className="absolute bottom-0 right-0 text-[10px] font-black uppercase text-slate-300">Hohe Leistung</div>
          <div className="absolute bottom-0 left-0 text-[10px] font-black uppercase text-slate-300 transform rotate-90 origin-bottom-left ml-4">Motivation Axis</div>
       </div>
    </div>
  );

  const renderProfiles = () => (
    <div className="space-y-6 animate-fade-in">
       <div className="relative mb-10 flex space-x-4">
          <div className="relative flex-grow">
            <Search className="absolute left-6 top-5 text-slate-400" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Mitarbeiter oder Abteilung suchen..."
              className="w-full p-5 pl-16 bg-white rounded-3xl border border-slate-100 shadow-sm outline-none focus:border-hs-blue transition-all"
            />
          </div>
          <button onClick={() => setIsEditingTeam(true)} className="bg-hs-blue text-white px-8 rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-hs-orange transition-all flex items-center">
             <UserPlus size={18} className="mr-2" /> Team verwalten
          </button>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map(e => (
             <div key={e.id} className="bg-white p-8 rounded-[2.5rem] shadow-md border border-slate-100 hover:shadow-xl transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-16 h-16 rounded-2xl bg-hs-blue/5 flex items-center justify-center text-hs-blue group-hover:bg-hs-blue group-hover:text-white transition-all">
                      <UserCheck size={32} />
                   </div>
                   <div className="bg-slate-50 px-3 py-1 rounded-full text-[10px] font-black uppercase text-slate-400">{e.department}</div>
                </div>
                <h4 className="text-xl font-black text-hs-blue uppercase mb-1">{e.name}</h4>
                <p className="text-xs font-bold text-hs-accent mb-6 uppercase tracking-widest">{e.role}</p>
                
                <div className="mb-6 space-y-2 flex-grow">
                   <p className="text-[10px] font-black text-slate-300 uppercase mb-2">Beobachtungen (Manuell geflegt)</p>
                   {e.observations?.positive && e.observations.positive.length > 0 ? e.observations.positive.slice(0, 1).map((o, idx) => (
                      <div key={idx} className="flex items-center text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1.5 rounded-lg border border-emerald-100/50">
                         <CheckCircle size={10} className="mr-1.5 shrink-0" /> <span className="truncate">{o}</span>
                      </div>
                   )) : <div className="text-[9px] text-slate-400 italic">Noch keine positiven Beobachtungen</div>}
                   {e.observations?.critical && e.observations.critical.length > 0 ? e.observations.critical.slice(0, 1).map((o, idx) => (
                      <div key={idx} className="flex items-center text-[10px] text-hs-orange font-bold bg-orange-50 px-2 py-1.5 rounded-lg border border-orange-100/50">
                         <AlertCircle size={10} className="mr-1.5 shrink-0" /> <span className="truncate">{o}</span>
                      </div>
                   )) : <div className="text-[9px] text-slate-400 italic">Noch keine kritischen Beobachtungen</div>}
                </div>

                <div className="space-y-4 mb-8">
                   <div>
                      <div className="flex justify-between text-[10px] font-black text-slate-400 mb-1"><span>Performance</span><span>{e.performance}%</span></div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                         <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${e.performance}%` }} />
                      </div>
                   </div>
                   <div>
                      <div className="flex justify-between text-[10px] font-black text-slate-400 mb-1"><span>Motivation</span><span>{e.motivation}%</span></div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                         <div className="bg-hs-orange h-full rounded-full" style={{ width: `${e.motivation}%` }} />
                      </div>
                   </div>
                </div>
                <button 
                  onClick={() => setSelectedEmployee(e)}
                  className="w-full py-4 bg-hs-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-md mt-auto"
                >
                  Führungs-Cockpit öffnen
                </button>
             </div>
          ))}
       </div>
    </div>
  );

  const renderHBDI = () => (
    <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-slate-100 animate-fade-in">
       <div className="text-center mb-12">
          <h3 className="text-2xl font-black text-hs-blue uppercase mb-2">HBDI Denkkontext</h3>
          <p className="text-slate-500">Systemische Verteilung der Denkpräferenzen im Team</p>
       </div>
       <div className="grid grid-cols-2 gap-1 i max-w-2xl mx-auto border-4 border-slate-100 rounded-3xl overflow-hidden shadow-inner p-2 bg-slate-50">
          <div className="aspect-square bg-hs-blue/80 p-8 flex flex-col items-center justify-center text-white relative">
             <span className="absolute top-4 left-4 font-black text-4xl opacity-20">A</span>
             <p className="font-black text-xs uppercase mb-4 tracking-widest">Rational</p>
             <div className="flex flex-wrap gap-2 justify-center">
                {employees.filter(e => e.hbdiQuadrant === 'A').map(e => (
                   <div key={e.id} className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-[10px] font-bold" title={e.name}>{e.name.split(' ')[0][0]}</div>
                ))}
             </div>
          </div>
          <div className="aspect-square bg-emerald-500/80 p-8 flex flex-col items-center justify-center text-white relative">
             <span className="absolute top-4 right-4 font-black text-4xl opacity-20">B</span>
             <p className="font-black text-xs uppercase mb-4 tracking-widest">Organisatorisch</p>
             <div className="flex flex-wrap gap-2 justify-center">
                {employees.filter(e => e.hbdiQuadrant === 'B').map(e => (
                   <div key={e.id} className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-[10px] font-bold" title={e.name}>{e.name.split(' ')[0][0]}</div>
                ))}
             </div>
          </div>
          <div className="aspect-square bg-hs-orange/80 p-8 flex flex-col items-center justify-center text-white relative">
             <span className="absolute bottom-4 left-4 font-black text-4xl opacity-20">C</span>
             <p className="font-black text-xs uppercase mb-4 tracking-widest">Emotional</p>
             <div className="flex flex-wrap gap-2 justify-center">
                {employees.filter(e => e.hbdiQuadrant === 'C').map(e => (
                   <div key={e.id} className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-[10px] font-bold" title={e.name}>{e.name.split(' ')[0][0]}</div>
                ))}
             </div>
          </div>
          <div className="aspect-square bg-hs-accent/80 p-8 flex flex-col items-center justify-center text-white relative">
             <span className="absolute bottom-4 right-4 font-black text-4xl opacity-20">D</span>
             <p className="font-black text-xs uppercase mb-4 tracking-widest">Konzeptionell</p>
             <div className="flex flex-wrap gap-2 justify-center">
                {employees.filter(e => e.hbdiQuadrant === 'D').map(e => (
                   <div key={e.id} className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-[10px] font-bold" title={e.name}>{e.name.split(' ')[0][0]}</div>
                ))}
             </div>
          </div>
       </div>
    </div>
  );

  const renderCockpit = () => {
    if (!selectedEmployee) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4 animate-fade-in overflow-y-auto">
         <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl relative flex flex-col lg:flex-row overflow-hidden max-h-[95vh]">
            <div className="lg:w-1/4 bg-slate-50 p-8 border-r border-slate-100 flex flex-col">
               <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-hs-blue text-white rounded-2xl flex items-center justify-center shadow-lg">
                     <UserCheck size={32} />
                  </div>
                  <button onClick={() => { setSelectedEmployee(null); setActiveInstrument(null); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24}/></button>
               </div>
               <h2 className="text-3xl font-black text-hs-blue uppercase leading-none mb-1">{selectedEmployee.name}</h2>
               <p className="text-hs-accent font-black uppercase text-[10px] tracking-widest mb-10">{selectedEmployee.role} • {selectedEmployee.department}</p>
               
               <div className="space-y-8 flex-grow">
                  <div>
                     <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 flex items-center"><CheckCircle size={14} className="mr-2 text-emerald-500" /> Positive Auffälligkeiten</h3>
                     <ul className="space-y-2">
                        {selectedEmployee.observations?.positive.map((o, idx) => (
                           <li key={idx} className="text-xs font-bold text-slate-700 bg-white p-4 rounded-xl border border-slate-100 shadow-sm leading-relaxed">{o}</li>
                        ))}
                     </ul>
                  </div>
                  <div>
                     <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 flex items-center"><AlertCircle size={14} className="mr-2 text-hs-orange" /> Kritische Auffälligkeiten</h3>
                     <ul className="space-y-2">
                        {selectedEmployee.observations?.critical.map((o, idx) => (
                           <li key={idx} className="text-xs font-bold text-slate-700 bg-white p-4 rounded-xl border border-slate-100 shadow-sm leading-relaxed">{o}</li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>

            <div className="lg:w-3/4 p-10 flex flex-col overflow-y-auto">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-hs-blue uppercase">Führungswerkzeuge</h3>
                  <div className="flex items-center space-x-2">
                    <span className="bg-slate-100 px-4 py-1.5 rounded-full text-[9px] font-black uppercase text-slate-400 tracking-widest">Aktiviertes Tooling</span>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  {(Object.keys(INSTRUMENT_TEMPLATES) as Array<keyof typeof INSTRUMENT_TEMPLATES>).map(key => {
                    const inst = INSTRUMENT_TEMPLATES[key];
                    return (
                      <button 
                        key={key} 
                        onClick={() => setActiveInstrument(key)}
                        className={`p-5 rounded-3xl border-2 flex flex-col items-center text-center transition-all ${activeInstrument === key ? 'border-hs-blue bg-hs-blue/5 shadow-lg' : 'border-slate-50 hover:border-hs-accent hover:bg-slate-50'}`}
                      >
                         <inst.icon size={28} className={`mb-3 ${activeInstrument === key ? 'text-hs-blue' : 'text-slate-400'}`} />
                         <span className="text-[9px] font-black uppercase tracking-tight leading-tight">{inst.title}</span>
                      </button>
                    );
                  })}
               </div>

               {activeInstrument ? (
                  <div className="animate-fade-in bg-slate-50 p-10 rounded-[3rem] border border-slate-100 flex-grow shadow-inner">
                     <div className="flex items-center space-x-4 mb-10 border-b border-slate-200 pb-8">
                        <div className="bg-hs-blue text-white p-4 rounded-2xl shadow-xl">
                           {React.createElement(INSTRUMENT_TEMPLATES[activeInstrument].icon, { size: 32 })}
                        </div>
                        <div>
                           <h4 className="text-2xl font-black text-hs-blue uppercase tracking-tight">{INSTRUMENT_TEMPLATES[activeInstrument].title}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leitfaden & Dokumentation</p>
                        </div>
                     </div>
                     <div className="space-y-10">
                        {INSTRUMENT_TEMPLATES[activeInstrument].sections.map((sec, i) => (
                           <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                              <div className="flex items-center space-x-3 mb-3">
                                 <div className="w-6 h-6 rounded-full bg-hs-accent text-white flex items-center justify-center text-[10px] font-black">{i+1}</div>
                                 <h5 className="font-black text-hs-blue uppercase text-xs tracking-widest">{sec.h}</h5>
                              </div>
                              <p className="text-xs font-bold text-slate-400 mb-4 ml-9">{sec.p}</p>
                              <textarea 
                                value={instrumentNotes[`${activeInstrument}-${selectedEmployee.id}-${i}`] || ''}
                                onChange={e => setInstrumentNotes({...instrumentNotes, [`${activeInstrument}-${selectedEmployee.id}-${i}`]: e.target.value})}
                                className="w-full h-32 bg-white border border-slate-100 rounded-[1.5rem] p-6 text-sm outline-none focus:border-hs-blue transition-all shadow-sm" 
                                placeholder="Ergebnisse der Besprechung hier dokumentieren..." 
                              />
                           </div>
                        ))}
                        <button 
                          onClick={() => { alert("Vorgang wurde im Intelligence Vault gesichert."); setSelectedEmployee(null); }}
                          className="w-full py-5 bg-hs-orange text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-hs-blue transition-all flex items-center justify-center group"
                        >
                           <SaveAll size={20} className="mr-3 group-hover:scale-110 transition-transform" /> Gesprächsergebnisse finalisieren & Vault sichern
                        </button>
                     </div>
                  </div>
               ) : (
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-16 border-4 border-dashed border-slate-50 rounded-[4rem] bg-slate-50/30">
                     <Sparkles size={64} className="text-slate-100 mb-6" />
                     <h4 className="text-lg font-black text-slate-300 uppercase mb-2">Instrument auswählen</h4>
                     <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest max-w-[200px]">Nutzen Sie eines der Templates, um das Gespräch strukturiert vorzubereiten</p>
                  </div>
               )}
            </div>
         </div>
      </div>
    );
  };

  if (step === 'LANDING') return (
    <div className="pt-24 pb-20 min-h-screen bg-slate-50">
       <button onClick={() => setView(ViewState.HOME)} className="max-w-6xl mx-auto mb-6 flex items-center text-slate-400 hover:text-hs-blue transition-colors font-black uppercase text-xs tracking-widest px-4">
           <ChevronLeft size={16} className="mr-1" /> {t('nav.back_home')}
       </button>
       {renderLanding()}
    </div>
  );

  return (
    <div className="pt-24 pb-12 min-h-screen bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Onboarding Flow Rendering */}
        {step === 'CONTEXT' && renderContextForm()}
        {step === 'CHALLENGE' && renderChallengeSketch()}
        {step === 'REFLECTION' && renderReflection()}
        {step === 'DECISION' && renderDecision()}
        {step === 'ANALYSIS' && renderAnalysis()}
        {step === 'TEAM_SKETCH' && renderTeamSketch()}

        {step === 'DASHBOARD' && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
              <div>
                 <button onClick={() => setStep('LANDING')} className="mb-4 flex items-center text-slate-400 hover:text-hs-blue transition-colors font-black uppercase text-[10px] tracking-widest">
                    <ChevronLeft size={14} className="mr-1" /> Zurück zum Setup
                 </button>
                 <h1 className="text-4xl font-black text-hs-blue uppercase tracking-tight">{t('area.lead')}</h1>
                 <p className="text-slate-500 font-medium">Interaktives Dashboard für wirksame Führungsinstrumente</p>
              </div>
              
              <div className="bg-white/50 backdrop-blur-sm px-6 py-4 rounded-[2rem] border border-slate-200 flex items-center space-x-4">
                 <Info className="text-hs-orange shrink-0" size={20} />
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Aktives Szenario</p>
                    <p className="text-xs font-bold text-hs-blue mt-1 truncate max-w-[200px]">{leaderContext.company || TEAM_SCENARIO.title}</p>
                 </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-200 mb-10 w-fit">
               {(['overview', 'matrix', 'profiles', 'hbdi'] as TabId[]).map(tab => (
                 <button 
                   key={tab} 
                   onClick={() => setActiveTab(tab)} 
                   className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-hs-blue text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-hs-blue'}`}
                 >
                   {t(`radar.tab.${tab}`)}
                 </button>
               ))}
            </div>

            <div className="min-h-[600px]">
               {activeTab === 'overview' && renderDashboard()}
               {activeTab === 'matrix' && renderMatrix()}
               {activeTab === 'profiles' && renderProfiles()}
               {activeTab === 'hbdi' && renderHBDI()}
            </div>
          </>
        )}

        {renderTeamEditor()}
        {selectedEmployee && renderCockpit()}
      </div>
    </div>
  );
};
