
import React, { useState } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, 
  ScatterChart, Scatter, ZAxis, ReferenceLine, Cell 
} from 'recharts';
import { analyzeLeadershipTeam, generateEmployeeCoaching, getLeadershipAuditQuestions } from '../services/geminiService';
import { Employee, CoachingGuide, AssessmentQuestion, AssessmentResponse } from '../types';
import { 
  Users, Activity, Sparkles, AlertCircle, LayoutDashboard, 
  UserPlus, MessageSquare, Target, TrendingUp, AlertTriangle, Briefcase, X
} from 'lucide-react';

// Enhanced Mock Data
const MOCK_DATA: Employee[] = [
  { id: 1, name: "Anna Müller", role: "Sales Lead", performance: 95, motivation: 60, workload: 92, department: "Sales" },
  { id: 2, name: "Ben Weber", role: "Senior Dev", performance: 92, motivation: 85, workload: 50, department: "IT" },
  { id: 3, name: "Carla Schmidt", role: "Support", performance: 55, motivation: 45, workload: 85, department: "Support" },
  { id: 4, name: "David Klein", role: "HR Manager", performance: 78, motivation: 72, workload: 60, department: "HR" },
  { id: 5, name: "Elena Fischer", role: "Marketing", performance: 88, motivation: 90, workload: 70, department: "Marketing" },
  { id: 6, name: "Felix Lang", role: "Junior Dev", performance: 40, motivation: 95, workload: 80, department: "IT" },
  { id: 7, name: "Greta Wolf", role: "Sales Rep", performance: 85, motivation: 20, workload: 40, department: "Sales" },
];

type TabId = 'overview' | 'matrix' | 'profiles';

export const LeadershipRadar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  
  // Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  
  // Assessment Modal State
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentQuestions] = useState<AssessmentQuestion[]>(getLeadershipAuditQuestions());
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});

  // Profile State
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [coachingGuide, setCoachingGuide] = useState<CoachingGuide | null>(null);
  const [loadingCoaching, setLoadingCoaching] = useState(false);

  // Handlers
  const handleStartAnalysis = () => {
    // Clear previous answers if re-running or keep them? Let's keep them for editability.
    if(Object.keys(assessmentAnswers).length === 0) {
      const init: Record<string, string> = {};
      assessmentQuestions.forEach(q => init[q.id] = '');
      setAssessmentAnswers(init);
    }
    setShowAssessment(true);
  };

  const handleAssessmentSubmit = async () => {
    setShowAssessment(false);
    setLoadingAnalysis(true);
    
    // Format answers
    const formattedAnswers: AssessmentResponse[] = assessmentQuestions.map(q => ({
      questionId: q.id,
      questionText: q.text,
      answer: assessmentAnswers[q.id] || "Keine Angabe"
    }));

    const result = await analyzeLeadershipTeam(MOCK_DATA, formattedAnswers);
    setAiAnalysis(result);
    setLoadingAnalysis(false);
  };

  const handleGenerateCoaching = async (emp: Employee) => {
    setLoadingCoaching(true);
    try {
      const guide = await generateEmployeeCoaching(emp);
      setCoachingGuide(guide);
    } catch (e) {
      console.error(e);
    }
    setLoadingCoaching(false);
  };

  // Renderers
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('###')) return <h3 key={i} className="text-lg font-bold text-hs-blue mt-4 mb-2">{line.replace('###', '')}</h3>;
      if (line.startsWith('**')) return <p key={i} className="font-bold mt-2">{line.replace(/\*\*/g, '')}</p>;
      if (line.startsWith('-')) return <li key={i} className="ml-4 mb-1 text-slate-700 list-disc">{line.replace('-', '')}</li>;
      return <p key={i} className="mb-2 text-slate-600 leading-relaxed">{line}</p>;
    });
  };

  const renderOverview = () => (
    <div className="space-y-8 animate-fade-in relative">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Team Radar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
              <Users className="mr-2 text-hs-accent" size={20} /> Team Fähigkeiten
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={MOCK_DATA.slice(0,5)}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" tick={{fontSize: 10}} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Performance" dataKey="performance" stroke="#0f172a" fill="#0f172a" fillOpacity={0.2} />
                  <Radar name="Motivation" dataKey="motivation" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.4} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-slate-400 mt-2">Vergleich Top 5 Mitarbeiter</p>
          </div>

          {/* Chart 2: Belastungs-Bar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
              <Activity className="mr-2 text-red-500" size={20} /> Belastungs-Index
            </h3>
            <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_DATA} layout="vertical" margin={{left: 20}}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} hide/>
                  <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11}} />
                  <Tooltip />
                  <Bar dataKey="workload" name="Workload" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
       </div>

       {/* AI Analysis Box */}
       <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
          <div className="bg-gradient-to-r from-hs-blue to-slate-800 p-6 flex justify-between items-center text-white">
            <div className="flex items-center">
              <Sparkles className="mr-3 text-yellow-300" />
              <div>
                <h2 className="font-bold text-lg">Systemischer Team-Audit</h2>
                <p className="text-slate-300 text-sm">AI-Analyse der Teamdynamik und Risikofaktoren</p>
              </div>
            </div>
            <button 
              onClick={handleStartAnalysis}
              disabled={loadingAnalysis}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-all backdrop-blur-sm border border-white/20"
            >
              {loadingAnalysis ? 'Analysiere...' : aiAnalysis ? 'Neu analysieren' : 'Audit Starten'}
            </button>
          </div>
          
          <div className="p-8">
            {aiAnalysis ? (
               <div className="prose prose-slate max-w-none">
                 {renderMarkdown(aiAnalysis)}
               </div>
            ) : (
               <div className="text-center py-8 text-slate-500">
                 <Target size={48} className="mx-auto mb-4 text-slate-200" />
                 <p>Klicken Sie auf "Audit Starten", um die Team-Situation zu bewerten und Muster zu erkennen.</p>
               </div>
            )}
          </div>
       </div>
    </div>
  );

  const renderMatrix = () => (
    <div className="animate-fade-in space-y-6">
       <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-xl font-bold text-hs-blue">Leistungs-Motivation-Matrix</h3>
              <p className="text-slate-500">Identifikation von Supportern, Distraktoren und Potenzialträgern.</p>
            </div>
          </div>
          
          <div className="h-[500px] w-full bg-slate-50 rounded-xl p-4 relative">
             <div className="absolute top-4 left-4 text-emerald-700/30 font-bold uppercase text-sm">Stars / Supporter</div>
             <div className="absolute top-4 right-4 text-blue-700/30 font-bold uppercase text-sm">Hohes Potenzial</div>
             <div className="absolute bottom-4 left-4 text-amber-700/30 font-bold uppercase text-sm">Workhorses</div>
             <div className="absolute bottom-4 right-4 text-red-700/30 font-bold uppercase text-sm">Risiko / Distraktoren</div>

             <ResponsiveContainer width="100%" height="100%">
               <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                 <CartesianGrid />
                 <XAxis type="number" dataKey="performance" name="Leistung" unit="%" domain={[0, 100]} label={{ value: 'Leistung', position: 'insideBottomRight', offset: -10 }} />
                 <YAxis type="number" dataKey="motivation" name="Motivation" unit="%" domain={[0, 100]} label={{ value: 'Motivation', angle: -90, position: 'insideLeft' }} />
                 <ZAxis type="number" dataKey="workload" range={[60, 400]} name="Workload" />
                 <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                 <ReferenceLine x={50} stroke="#cbd5e1" strokeDasharray="3 3" />
                 <ReferenceLine y={50} stroke="#cbd5e1" strokeDasharray="3 3" />
                 <Scatter name="Mitarbeiter" data={MOCK_DATA} fill="#0ea5e9">
                    {MOCK_DATA.map((entry, index) => {
                      let color = '#94a3b8'; // default
                      if (entry.performance > 60 && entry.motivation > 60) color = '#10b981'; // Star (Green)
                      else if (entry.performance < 50 && entry.motivation < 50) color = '#ef4444'; // Risk (Red)
                      else if (entry.performance > 60 && entry.motivation < 50) color = '#f59e0b'; // Boreout/Distractor (Orange)
                      else if (entry.performance < 50 && entry.motivation > 60) color = '#3b82f6'; // Potential (Blue)
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                 </Scatter>
               </ScatterChart>
             </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mt-6">
             <div className="flex items-center text-sm text-slate-600"><div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div> Leistungsträger (Supporter)</div>
             <div className="flex items-center text-sm text-slate-600"><div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div> Potenzialträger</div>
             <div className="flex items-center text-sm text-slate-600"><div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div> Kritische Haltung</div>
             <div className="flex items-center text-sm text-slate-600"><div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div> Akutes Handlungsrisiko</div>
          </div>
       </div>
    </div>
  );

  const renderProfiles = () => (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
       {/* Left: List */}
       <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-hs-blue">Mitarbeiter-Profile</h3>
            <p className="text-xs text-slate-500">Wählen Sie ein Profil für Details</p>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {MOCK_DATA.map(emp => (
              <button
                key={emp.id}
                onClick={() => {
                  setSelectedEmployee(emp);
                  setCoachingGuide(null);
                }}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${
                  selectedEmployee?.id === emp.id 
                    ? 'bg-hs-blue text-white shadow-md' 
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <span className="font-bold block">{emp.name}</span>
                  <span className={`text-xs ${selectedEmployee?.id === emp.id ? 'text-slate-300' : 'text-slate-500'}`}>{emp.role}</span>
                </div>
                <div className={`text-xs font-mono px-2 py-1 rounded ${
                  emp.performance > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {emp.performance}% Perf.
                </div>
              </button>
            ))}
          </div>
       </div>

       {/* Right: Detail & AI Action */}
       <div className="lg:col-span-8 flex flex-col h-full">
         {selectedEmployee ? (
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
             {/* Header */}
             <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
               <div className="flex items-center">
                  <div className="w-12 h-12 bg-hs-accent/10 text-hs-accent rounded-full flex items-center justify-center font-bold text-xl mr-4">
                    {selectedEmployee.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-hs-blue">{selectedEmployee.name}</h2>
                    <p className="text-slate-500 flex items-center text-sm">
                      <Briefcase size={14} className="mr-1"/> {selectedEmployee.role} &bull; {selectedEmployee.department}
                    </p>
                  </div>
               </div>
               <button 
                 onClick={() => handleGenerateCoaching(selectedEmployee)}
                 disabled={loadingCoaching}
                 className="flex items-center bg-hs-accent text-white px-4 py-2 rounded-lg hover:bg-sky-500 transition-colors shadow-lg shadow-sky-200"
               >
                 {loadingCoaching ? <Activity className="animate-spin mr-2" size={18}/> : <MessageSquare className="mr-2" size={18}/>}
                 1:1 Gespräch planen
               </button>
             </div>

             {/* Content Scrollable */}
             <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Performance</span>
                    <span className={`text-2xl font-bold ${selectedEmployee.performance > 80 ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {selectedEmployee.performance}%
                    </span>
                  </div>
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Motivation</span>
                    <span className={`text-2xl font-bold ${selectedEmployee.motivation < 50 ? 'text-red-500' : 'text-slate-700'}`}>
                      {selectedEmployee.motivation}%
                    </span>
                  </div>
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <span className="block text-slate-400 text-xs uppercase tracking-wider mb-1">Workload</span>
                    <span className={`text-2xl font-bold ${selectedEmployee.workload > 85 ? 'text-amber-500' : 'text-slate-700'}`}>
                      {selectedEmployee.workload}%
                    </span>
                  </div>
                </div>

                {coachingGuide ? (
                  <div className="animate-fade-in bg-indigo-50 rounded-xl border border-indigo-100 p-6">
                     <h3 className="text-indigo-900 font-bold mb-4 flex items-center">
                       <Sparkles className="mr-2 text-indigo-500" size={20}/> Coaching Leitfaden
                     </h3>
                     <div className="space-y-4">
                       <div>
                         <span className="text-xs font-bold text-indigo-400 uppercase">Fokus Thema</span>
                         <p className="font-semibold text-indigo-900">{coachingGuide.focusArea}</p>
                       </div>
                       <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                         <span className="text-xs font-bold text-indigo-400 uppercase block mb-1">Einstiegsfrage</span>
                         <p className="text-slate-700 italic">"{coachingGuide.openingQuestion}"</p>
                       </div>
                       <div>
                         <span className="text-xs font-bold text-indigo-400 uppercase">Schlüsselpunkte</span>
                         <ul className="list-disc ml-4 mt-1 space-y-1 text-sm text-indigo-900">
                           {coachingGuide.keyPoints.map((kp, i) => <li key={i}>{kp}</li>)}
                         </ul>
                       </div>
                       <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 text-sm">
                          <span className="text-xs font-bold text-emerald-600 uppercase block mb-1">Zielvereinbarung</span>
                          {coachingGuide.actionPlan}
                       </div>
                     </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
                    <p>Wählen Sie "1:1 Gespräch planen", um einen individuellen Leitfaden zu generieren.</p>
                  </div>
                )}
             </div>
           </div>
         ) : (
           <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
             <UserPlus size={48} className="mb-4 text-slate-300"/>
             <p>Wählen Sie einen Mitarbeiter aus der Liste.</p>
           </div>
         )}
       </div>
    </div>
  );

  return (
    <div className="pt-24 pb-12 min-h-screen bg-slate-50 relative">
      {/* ASSESSMENT MODAL OVERLAY */}
      {showAssessment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
               <div>
                 <h2 className="text-xl font-bold text-hs-blue">Start-Assessment: Leadership</h2>
                 <p className="text-sm text-slate-500">Ihre Einschätzung zur Situation</p>
               </div>
               <button onClick={() => setShowAssessment(false)} className="text-slate-400 hover:text-red-500">
                 <X size={24} />
               </button>
             </div>
             
             <div className="p-6 space-y-6">
                {assessmentQuestions.map((q, idx) => (
                   <div key={q.id}>
                     <label className="block text-sm font-bold text-slate-700 mb-2">{idx + 1}. {q.text}</label>
                     <textarea
                       value={assessmentAnswers[q.id] || ''}
                       onChange={(e) => setAssessmentAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                       placeholder={q.placeholder}
                       className="w-full h-20 rounded-lg border-slate-300 border p-3 text-sm focus:ring-2 focus:ring-hs-accent focus:border-transparent outline-none resize-none bg-slate-50"
                     ></textarea>
                   </div>
                ))}
             </div>

             <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
                <button 
                  onClick={handleAssessmentSubmit}
                  className="bg-hs-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg"
                >
                  Analyse starten
                </button>
             </div>
           </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-hs-blue">Führungsradar</h1>
            <p className="text-slate-500">Systemisches Management Dashboard & Mitarbeiterentwicklung</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-fit mb-8">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-hs-blue text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={16} className="mr-2" /> Überblick
          </button>
          <button 
            onClick={() => setActiveTab('matrix')}
             className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'matrix' ? 'bg-hs-blue text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Target size={16} className="mr-2" /> Supporter-Matrix
          </button>
          <button 
            onClick={() => setActiveTab('profiles')}
             className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'profiles' ? 'bg-hs-blue text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <UserPlus size={16} className="mr-2" /> Einzelprofile & Coaching
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'matrix' && renderMatrix()}
          {activeTab === 'profiles' && renderProfiles()}
        </div>

      </div>
    </div>
  );
};
