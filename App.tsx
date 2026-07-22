import React, { useState, useEffect, useRef } from 'react';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { ChangeManager } from './pages/ChangeManager';
import { LeadershipRadar } from './pages/LeadershipRadar';
import { OrganizationAnalyzer } from './pages/OrganizationAnalyzer';
import { ReorgSimulator } from './pages/ReorgSimulator';
import { CultureScanner } from './pages/CultureScanner';
import { StrategyClarifier } from './pages/StrategyClarifier';
import { VentureForge } from './pages/VentureForge';
import { Microtrainings } from './pages/Microtrainings';
import { MinimalInvasiveChange } from './pages/MinimalInvasiveChange';
import { Quickstart } from './pages/Quickstart';
import { SprintMyOrg } from './pages/SprintMyOrg';
import { PimpMyOrg } from './pages/PimpMyOrg';
import { AgileChangeBootcamp } from './pages/AgileChangeBootcamp';
import { Clients } from './pages/Clients';
import { Publications } from './pages/Publications';
import { Security } from './pages/Security';
import { FileVault } from './pages/FileVault';
import { Legal } from './pages/Legal';
import { AdminDashboard } from './pages/AdminDashboard';
import { Footer } from './components/Footer';
import { Auth } from './components/Auth';
import { Profile } from './components/Profile';
import { ViewState, OrgContext, FileRecord } from './types';
import { auth, onAuthStateChanged, db, collection, onSnapshot } from './services/firebase';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { startResultaChat } from './services/geminiService';
import { 
  Loader2, Sparkles, Layout, Compass, MessageCircle, Users, Cpu, 
  Rocket, ChevronRight, Activity, X, Send, User, Bot, ArrowRight, ShieldCheck 
} from 'lucide-react';

const AppContent: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [orgContext, setOrgContext] = useState<OrgContext | null>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [usedStorage, setUsedStorage] = useState(0);
  const { t, language } = useLanguage();

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setUsedStorage(0);
      return;
    }
    const filesRef = collection(db, "users", user.uid, "files");
    const unsubscribeFiles = onSnapshot(filesRef, (snapshot) => {
      const totalSize = snapshot.docs.reduce((acc, doc) => {
        const data = doc.data() as FileRecord;
        return acc + (data.fileSize || 0);
      }, 0);
      setUsedStorage(totalSize);
    });
    return () => unsubscribeFiles();
  }, [user]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!chatSessionRef.current) {
      chatSessionRef.current = startResultaChat(language as any);
      if (chatMessages.length === 0) {
        const welcome = language === 'de' 
          ? 'Guten Tag! Ich bin Resulta. Wie kann ich Sie heute bei Ihrer Transformation unterstützen? Ich kann Ihnen Tools empfehlen oder Fragen zum Datenschutz beantworten.'
          : 'Hello! I am Resulta. How can I support your transformation today? I can recommend tools or answer questions about data protection.';
        setChatMessages([{ role: 'bot', text: welcome }]);
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userText = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      if (!chatSessionRef.current) chatSessionRef.current = startResultaChat(language as any);
      const result = await chatSessionRef.current.sendMessage({ message: userText });
      setChatMessages(prev => [...prev, { role: 'bot', text: result.text }]);
    } catch (err) {
      console.error("Chat Error:", err);
      setChatMessages(prev => [...prev, { role: 'bot', text: "Entschuldigung, da ist etwas schiefgelaufen. Bitte versuchen Sie es gleich noch einmal." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessageContent = (text: string) => {
    // Regex to find [TOOL:VIEW_STATE] markers
    const parts = text.split(/(\[TOOL:[A-Z_]+\])/g);
    return parts.map((part, i) => {
      const match = part.match(/\[TOOL:([A-Z_]+)\]/);
      if (match) {
        const toolId = match[1] as ViewState;
        return (
          <button 
            key={i}
            onClick={() => { setView(toolId); setIsChatOpen(false); }}
            className="inline-flex items-center px-3 py-1.5 my-1 mx-1 bg-hs-orange/10 border border-hs-orange/30 text-hs-orange rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-hs-orange hover:text-white transition-all shadow-sm"
          >
            Zum Tool: {toolId.replace(/_/g, ' ')} <ArrowRight size={12} className="ml-1" />
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-hs-blue" size={48} />
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case ViewState.HOME: return <Home setView={setView} user={user} />;
      case ViewState.LOGIN: return <Auth onAuthSuccess={() => setView(ViewState.HOME)} />;
      case ViewState.PROFILE: return <Profile user={user} setView={setView} usedStorage={usedStorage} />;
      case ViewState.CHANGE_MANAGER: return <ChangeManager user={user} setView={setView} orgContext={orgContext} clearOrgContext={() => setOrgContext(null)} />;
      case ViewState.LEADERSHIP_RADAR: return <LeadershipRadar user={user} setView={setView} />;
      case ViewState.ORGANIZATION_ANALYZER: return <OrganizationAnalyzer user={user} setView={setView} setOrgContext={setOrgContext} />;
      case ViewState.REORG_SIMULATOR: return <ReorgSimulator user={user} setView={setView} setOrgContext={setOrgContext} orgContext={orgContext} />;
      case ViewState.CULTURE_SCANNER: return <CultureScanner user={user} setView={setView} />;
      case ViewState.STRATEGY_CLARIFIER: return <StrategyClarifier user={user} setView={setView} setOrgContext={setOrgContext} />;
      case ViewState.INNOVATION_IDEATOR: return <VentureForge user={user} setView={setView} />;
      case ViewState.MICROTRAININGS: return <Microtrainings setView={setView} />;
      case ViewState.MINIMAL_INVASIVE_CHANGE: return <MinimalInvasiveChange setView={setView} />;
      case ViewState.QUICKSTART: return <Quickstart setView={setView} />;
      case ViewState.SPRINT_MY_ORG: return <SprintMyOrg setView={setView} />;
      case ViewState.PIMP_MY_ORG: return <PimpMyOrg setView={setView} />;
      case ViewState.AGILE_CHANGE_BOOTCAMP: return <AgileChangeBootcamp setView={setView} />;
      case ViewState.CLIENTS: return <Clients setView={setView} />;
      case ViewState.PUBLICATIONS: return <Publications setView={setView} />;
      case ViewState.SECURITY: return <Security setView={setView} />;
      case ViewState.FILE_VAULT: return <FileVault user={user} setView={setView} />;
      case ViewState.LEGAL: return <Legal setView={setView} />;
      case ViewState.ADMIN: return <AdminDashboard setView={setView} user={user} />;
      default: return <Home setView={setView} user={user} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 relative">
      <Navigation currentView={view} setView={setView} user={user} usedStorage={usedStorage} />
      <main className="flex-grow">
        {renderView()}
      </main>

      {/* RESULTA CHATBOT UI */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end space-y-4 no-print">
        {isChatOpen && (
          <div className="w-[380px] h-[550px] bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 flex flex-col overflow-hidden animate-fade-in animate-slide-up origin-bottom-right">
            {/* Header */}
            <div className="bg-hs-blue p-6 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10"><Bot size={80} /></div>
               <div className="flex items-center space-x-3 relative z-10">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                     <Bot size={24} className="text-hs-orange" />
                  </div>
                  <div>
                    <p className="font-black text-sm uppercase tracking-widest">Resulta</p>
                    <p className="text-[10px] text-hs-accent font-bold uppercase tracking-widest">hs:results Begleiterin</p>
                  </div>
               </div>
               <button onClick={toggleChat} className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10"><X size={20}/></button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-slate-50/50">
               {chatMessages.map((m, i) => (
                 <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-hs-blue text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}>
                      {renderMessageContent(m.text)}
                    </div>
                 </div>
               ))}
               {isTyping && (
                 <div className="flex justify-start animate-fade-in">
                    <div className="bg-white p-4 rounded-[1.5rem] rounded-tl-none border border-slate-100 shadow-sm flex items-center space-x-1">
                       <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                       <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                       <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></div>
                    </div>
                 </div>
               )}
               <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center space-x-2">
               <input 
                 type="text" 
                 value={chatInput} 
                 onChange={e => setChatInput(e.target.value)}
                 placeholder="Wie kann ich helfen?" 
                 className="flex-grow bg-slate-50 border border-slate-100 p-3 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-hs-orange/20 focus:border-hs-orange transition-all"
               />
               <button type="submit" disabled={!chatInput.trim() || isTyping} className="bg-hs-orange text-white p-3 rounded-2xl hover:bg-hs-blue transition-all shadow-md disabled:opacity-30">
                  <Send size={18} />
               </button>
            </form>
            
            {/* Security Note */}
            <div className="px-4 pb-4 pt-1 bg-white flex items-center justify-center space-x-2">
               <ShieldCheck size={12} className="text-emerald-500" />
               <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">DSGVO-Gesichert • EU Hosting</span>
            </div>
          </div>
        )}

        {/* Floating Bubble */}
        <button 
          onClick={toggleChat}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group ${
            isChatOpen ? 'bg-white text-hs-blue' : 'bg-hs-blue text-white'
          }`}
        >
          {isChatOpen ? <X size={28} /> : <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />}
          
          {!isChatOpen && (
            <div className="absolute right-full mr-4 bg-white px-4 py-2 rounded-2xl shadow-xl border border-slate-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
               <p className="text-xs font-black text-hs-blue uppercase tracking-widest">Fragen Sie Resulta</p>
               <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-r border-t border-slate-100"></div>
            </div>
          )}
        </button>
      </div>

      {/* Interactive AI Stamp */}
      <div className="fixed bottom-32 right-8 z-[60] group no-print">
        {/* Tooltip / Marketing Statement */}
        <div className="absolute bottom-full right-0 mb-32 w-64 bg-hs-blue text-white p-4 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 border border-white/10 pointer-events-none">
           <p className="text-sm font-bold leading-tight">
             {t('stamp.marketing')}<br/>
             <span className="text-hs-accent">{t('stamp.statement')}</span>
           </p>
           <div className="absolute bottom-[-6px] right-8 w-3 h-3 bg-hs-blue rotate-45 border-r border-b border-white/10"></div>
        </div>

        {/* Floating AI Tool Menu */}
        <div className="absolute bottom-full right-0 mb-6 w-72 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 p-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-10 group-hover:translate-y-0 overflow-hidden">
           <div className="mb-4 px-3">
              <div className="flex items-center space-x-2 text-hs-orange mb-1">
                 <Sparkles size={14} className="animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">hs:results Intelligence</span>
              </div>
              <p className="text-xs font-bold text-slate-500">{t('stamp.select')}</p>
           </div>
           
           <div className="space-y-1">
              {/* 1. Organisation */}
              <button 
                onClick={() => setView(ViewState.ORGANIZATION_ANALYZER)}
                className="w-full text-left p-3 hover:bg-slate-50 rounded-2xl flex items-center group/item transition-all"
              >
                 <div className="w-10 h-10 rounded-xl bg-hs-blue/5 flex items-center justify-center text-hs-blue mr-4 group-hover/item:bg-hs-blue group-hover/item:text-white transition-colors">
                    <Layout size={18} />
                 </div>
                 <div className="flex-grow">
                    <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{t('area.org')}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Prototype</p>
                 </div>
                 <ChevronRight size={14} className="text-slate-200 group-hover/item:text-hs-orange transition-transform group-hover/item:translate-x-1" />
              </button>

              {/* 2. Strategie */}
              <button 
                onClick={() => setView(ViewState.STRATEGY_CLARIFIER)}
                className="w-full text-left p-3 hover:bg-slate-50 rounded-2xl flex items-center group/item transition-all"
              >
                 <div className="w-10 h-10 rounded-xl bg-hs-orange/5 flex items-center justify-center text-hs-orange mr-4 group-hover/item:bg-hs-orange group-hover/item:text-white transition-colors">
                    <Compass size={18} />
                 </div>
                 <div className="flex-grow">
                    <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{t('area.strat')}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Prototype</p>
                 </div>
                 <ChevronRight size={14} className="text-slate-200 group-hover/item:text-hs-orange transition-transform group-hover/item:translate-x-1" />
              </button>

              {/* 3. Unternehmenskultur */}
              <button 
                onClick={() => setView(ViewState.CULTURE_SCANNER)}
                className="w-full text-left p-3 hover:bg-slate-50 rounded-2xl flex items-center group/item transition-all"
              >
                 <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mr-4 group-hover/item:bg-emerald-600 group-hover/item:text-white transition-colors">
                    <MessageCircle size={18} />
                 </div>
                 <div className="flex-grow">
                    <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{t('area.cult')}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Prototype</p>
                 </div>
                 <ChevronRight size={14} className="text-slate-200 group-hover/item:text-hs-orange transition-transform group-hover/item:translate-x-1" />
              </button>

              {/* 4. Führung (Leadership Radar) */}
              <button 
                onClick={() => setView(ViewState.LEADERSHIP_RADAR)}
                className="w-full text-left p-3 hover:bg-slate-50 rounded-2xl flex items-center group/item transition-all"
              >
                 <div className="w-10 h-10 rounded-xl bg-hs-blue/5 flex items-center justify-center text-hs-blue mr-4 group-hover/item:bg-hs-blue group-hover/item:text-white transition-colors">
                    <Activity size={18} />
                 </div>
                 <div className="flex-grow">
                    <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{t('area.lead')}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Dashboard</p>
                 </div>
                 <ChevronRight size={14} className="text-slate-200 group-hover/item:text-hs-orange transition-transform group-hover/item:translate-x-1" />
              </button>

              {/* 5. Veränderung */}
              <button 
                onClick={() => setView(ViewState.CHANGE_MANAGER)}
                className="w-full text-left p-3 hover:bg-slate-50 rounded-2xl flex items-center group/item transition-all"
              >
                 <div className="w-10 h-10 rounded-xl bg-hs-accent/5 flex items-center justify-center text-hs-accent mr-4 group-hover/item:bg-hs-accent group-hover/item:text-white transition-colors">
                    <Cpu size={18} />
                 </div>
                 <div className="flex-grow">
                    <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{t('area.change')}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Prototype</p>
                 </div>
                 <ChevronRight size={14} className="text-slate-200 group-hover/item:text-hs-orange transition-transform group-hover/item:translate-x-1" />
              </button>

              {/* 6. Digitale Transformation */}
              <button 
                onClick={() => setView(ViewState.INNOVATION_IDEATOR)}
                className="w-full text-left p-3 bg-hs-blue/5 rounded-2xl flex items-center group/item transition-all mt-2 border border-hs-blue/10"
              >
                 <div className="w-10 h-10 rounded-xl bg-hs-blue flex items-center justify-center text-white mr-4 group-hover/item:bg-hs-orange transition-colors">
                    <Rocket size={18} />
                 </div>
                 <div className="flex-grow">
                    <p className="text-sm font-black text-hs-blue uppercase tracking-tight">{t('area.digit')}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">VentureForge</p>
                 </div>
                 <ChevronRight size={14} className="text-hs-blue group-hover/item:text-hs-orange transition-transform group-hover/item:translate-x-1" />
              </button>
           </div>
        </div>

        {/* The Visual Stamp */}
        <div className="bg-hs-orange text-white w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-[0_15px_45px_rgba(249,115,22,0.5)] cursor-pointer transform -rotate-12 group-hover:rotate-0 transition-all duration-500 border-[6px] border-white border-double ring-4 ring-hs-orange/10 hover:scale-110 active:scale-95">
           <Sparkles size={32} className="mb-1 text-white animate-pulse" />
           <span className="text-[12px] font-black uppercase tracking-tighter text-center leading-[1.1]">
              {t('stamp.title').split(' ').slice(0, 2).join(' ')}<br/>
              <span className="text-[10px] opacity-80">{t('stamp.title').split(' ').slice(2).join(' ')}</span>
           </span>
           {/* Authentic Stamp Texture Overlay */}
           <div className="absolute inset-0 rounded-full opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>
      </div>

      <Footer setView={setView} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};

export default App;