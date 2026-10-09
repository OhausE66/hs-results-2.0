
import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { 
  Plus, Brain, Target, ArrowRight, X, Mail, Phone, MapPin, 
  Briefcase, GraduationCap, Building, Download, Sparkles, 
  Rocket, CheckCircle2, Award, User, Globe, Printer, Upload, Loader2, Database, Info, AlertCircle, ShieldCheck, Copy, ShieldAlert, Lock, Unlock, UserCheck, Shield, Terminal, 
  Layout, Compass, MessageCircle, Users, Cpu, Zap, FileText, ImageIcon, Trash2, ExternalLink, UserMinus, RefreshCw, Settings2, FileArchive, ChevronDown, Quote, Eye, Edit
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  db, 
  collection, 
  onSnapshot, 
  isFirebaseConfigured, 
  auth,
  listHomepageAssets,
  uploadHomepageAsset,
  deleteHomepageAsset,
  deleteConsultant,
  saveConsultant,
  getConsultants,
  uploadConsultantImage,
  uploadConsultantCV,
  uploadPublicationPDF,
  deletePublicationPDF
} from '../services/firebase';

const ADMIN_EMAILS = [
  'olafheger@hs-results.com',
  'heger@hs-results.com', 
  'olaf.heger@gmail.com',
  'olafheger@arcor.de'
];

interface HomeProps {
  setView: (view: ViewState) => void;
  user: any;
}

interface ConsultantProfile {
  id?: string;
  name: string;
  title: string;
  img: string;
  cvUrl?: string; 
  email: string;
  phone: string;
  address: string;
  intro: string;
  focus: string[];
  background: string[];
  projects: string[];
  customers: string[];
}

const TESTIMONIALS = [
  {
    text: "We from Siemens Healthineers have a long and fruitful history of collaboration with HS:results. They are cooperative and competent, bring in highly innovative ideas and react very flexible on our requests.",
    author: "Sabine Engelhardt, Siemens Healthcare GmbH"
  },
  {
    text: "The amazing outcome proofs that we created a workshop with the support of hs:results, which is based on future business needs and empowers service employees to shape structural change proactively.",
    author: "Herbert Schneider, Siemens Smart Infrastructure"
  },
  {
    text: "hs:results baute zu mir und meinem sehr heterogenen Team schnell eine Vertrauensbeziehung auf und schaffte es mit einem neutralen Blick auf die Dinge auch kritische Situationen zu einer Lösung zu bringen.",
    author: "Guido Marenbach, Geschäftsführer Wilhelm STOLL Maschinenfabrik GmbH"
  },
  {
    text: "Beratung mit hs:results? Pragmatisch, fundiert, direkt und werthaltig – sehr hilfreich, um gemeinsam den eigenen Fokus zu finden.",
    author: "Nils Dreßler, Senior Project Manager, Lufthansa Cargo"
  },
  {
    text: "In der Zusammenarbeit mit hs:results schätzen wir besonders die Fähigkeit, mit extrem unterschiedlichen Zielgruppen zielorientiert, humorvoll und mit einer klaren, direkten Ansprache zu arbeiten.",
    author: "Dr. Erich Reuter, Projektleiter Reorganisation"
  },
  {
    text: "hs:results halfen uns einen tollen Arbeitsspirit zu erzeugen. Meine Teilnahme an der Change-Driver-Ausbildung war eine der besten Sachen, die ich je gemacht habe.",
    author: "Irene Gräf, Lufthansa Cargo AG",
    linkView: ViewState.PUBLICATIONS
  },
  {
    text: "Hs:results schafft es, in extrem kurzer Zeit innovative, passgenaue Lösungen zu entwickeln, die Führungskräfte zum Mitmachen und Umsetzen motivieren.",
    author: "Björn S. Riddermann, Vice President TDK Sensors"
  },
  {
    text: "Ich bin immer froh und voller Euphorie, wenn wir zusammen arbeiten können. Ich schätze sehr die Vorgehensweise und die anschliessende sehr gut verständliche Analyse.",
    author: "Oliver Bard, Vice President TDK Sensors"
  }
];

export const Home: React.FC<HomeProps> = ({ setView, user }) => {
  const { t, language } = useLanguage();
  const [consultants, setConsultants] = useState<ConsultantProfile[]>([]);
  const [selectedConsultant, setSelectedConsultant] = useState<ConsultantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [devMode, setDevMode] = useState(localStorage.getItem('hs_results_dev_admin') === 'true' || localStorage.getItem('hs_results_admin') === 'true');
  const [showAllConsultants, setShowAllConsultants] = useState(false);
  
  // Admin State
  const [adminTab, setAdminTab] = useState<'consultants' | 'assets' | 'system'>('consultants');
  const [assets, setAssets] = useState<{name: string, url: string}[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  const isAdmin = (user && ADMIN_EMAILS.includes(user.email || '')) || devMode;

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "consultants"), 
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ConsultantProfile));
        if (docs.length > 0) {
          setConsultants(docs);
        } else {
          setConsultants(getTranslatedDefaultConsultants(language));
        }
        setLoading(false);
      },
      (error) => {
        setConsultants(getTranslatedDefaultConsultants(language));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [language]);

  useEffect(() => {
    if (showAdmin && adminTab === 'assets') {
      loadAssets();
    }
  }, [showAdmin, adminTab]);

  const loadAssets = async () => {
    setLoadingAssets(true);
    try {
      const items = await listHomepageAssets();
      setAssets(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleDownloadProfile = (c: ConsultantProfile) => {
    if (c.cvUrl) {
      window.open(c.cvUrl, '_blank');
      return;
    }

    const content = `BERATERINNENPROFIL: ${c.name}\n${c.title}\n--------------------------------------------------\nKONTAKT\nEmail: ${c.email}\nPhone: ${c.phone}\nAddresse: ${c.address}\n\nFOKUS & MISSION\n"${c.intro}"\n\nEXPERTISE\n${c.focus.map(f => `- ${f}`).join('\n')}\n\nKUNDEN\n${c.customers.join(', ')}\n\nHS-RESULTS: Das Ergebnis zählt.\nwww.hs-results.com`;
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `hs-results_Profil_${c.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const solutionCards = [
    { id: ViewState.ORGANIZATION_ANALYZER, title: t('home.sol.org'), desc: t('home.sol.org.desc'), icon: Layout, color: 'hs-blue', accent: 'hs-accent' },
    { id: ViewState.STRATEGY_CLARIFIER, title: t('home.sol.strat'), desc: t('home.sol.strat.desc'), icon: Compass, color: 'hs-blue', accent: 'hs-orange' },
    { id: ViewState.CULTURE_SCANNER, title: t('home.sol.cult'), desc: t('home.sol.cult.desc'), icon: MessageCircle, color: 'hs-blue', accent: 'emerald-500' },
    { id: ViewState.LEADERSHIP_RADAR, title: t('home.sol.lead'), desc: t('home.sol.lead.desc'), icon: Users, color: 'hs-blue', accent: 'hs-accent' },
    { id: ViewState.CHANGE_MANAGER, title: t('home.sol.change'), desc: t('home.sol.change.desc'), icon: Cpu, color: 'hs-blue', accent: 'hs-orange' },
    { id: ViewState.INNOVATION_IDEATOR, title: t('home.sol.digi'), desc: t('home.sol.digi.desc'), icon: Rocket, color: 'hs-blue', accent: 'hs-accent' },
  ];

  const featuredConsultants = consultants.filter(c => 
    c.name.includes("Olaf") || c.name.includes("Andre") || c.name.includes("Silvia")
  );
  
  const displayedConsultants = showAllConsultants ? consultants : featuredConsultants;

  const renderAdminDashboard = () => (
    <div className="bg-slate-900 text-white min-h-[600px] rounded-[3rem] p-12 shadow-2xl animate-fade-in mb-20 border-4 border-hs-orange/30">
       <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-4">
             <div className="p-3 bg-hs-orange rounded-2xl shadow-lg">
                <Terminal size={32} />
             </div>
             <div>
                <h2 className="text-3xl font-black uppercase tracking-tight">HS:Results Admin Dashboard</h2>
                <p className="text-hs-orange font-bold uppercase text-[10px] tracking-widest">Master Control Unit</p>
             </div>
          </div>
          <button onClick={() => setShowAdmin(false)} className="p-4 bg-white/10 hover:bg-red-500 transition-all rounded-full">
             <X size={24} />
          </button>
       </div>

       <div className="flex space-x-2 mb-10 bg-white/5 p-1 rounded-2xl w-fit border border-white/10">
          <button onClick={() => setAdminTab('consultants')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminTab === 'consultants' ? 'bg-hs-orange text-white' : 'text-slate-400 hover:text-white'}`}>BeraterInnen</button>
          <button onClick={() => setAdminTab('assets')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminTab === 'assets' ? 'bg-hs-orange text-white' : 'text-slate-400 hover:text-white'}`}>Cloud Assets</button>
          <button onClick={() => setAdminTab('system')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${adminTab === 'system' ? 'bg-hs-orange text-white' : 'text-slate-400 hover:text-white'}`}>Security Rules</button>
       </div>

       {adminTab === 'consultants' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold uppercase">BeraterInnen-Profile ({consultants.length})</h3>
                <button className="flex items-center space-x-2 bg-hs-blue hover:bg-hs-orange px-6 py-3 rounded-xl transition-all font-black text-xs uppercase shadow-lg">
                   <Plus size={16} /> <span>Neu anlegen</span>
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {consultants.map((c, i) => (
                   <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center space-x-6 group">
                      <img src={c.img} className="w-16 h-16 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" alt={c.name} />
                      <div className="flex-grow">
                         <p className="font-bold text-lg">{c.name}</p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{c.title}</p>
                      </div>
                      <div className="flex space-x-2">
                         <button className="p-2 bg-white/5 hover:bg-hs-accent rounded-lg transition-colors"><Edit size={16}/></button>
                         <button onClick={() => deleteConsultant(c.name, c.id)} className="p-2 bg-white/5 hover:bg-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       )}

       {adminTab === 'assets' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold uppercase">Mediathek (Homepage Assets)</h3>
                <button className="flex items-center space-x-2 bg-hs-blue hover:bg-hs-orange px-6 py-3 rounded-xl transition-all font-black text-xs uppercase shadow-lg">
                   <Upload size={16} /> <span>Asset Hochladen</span>
                </button>
             </div>
             {loadingAssets ? <Loader2 size={32} className="animate-spin mx-auto text-hs-orange" /> : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                   {assets.map((asset, i) => (
                      <div key={i} className="group relative aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                         <img src={asset.url} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" alt={asset.name} />
                         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            <button onClick={() => window.open(asset.url, '_blank')} className="p-2 bg-white/10 hover:bg-hs-accent rounded-lg"><Eye size={16}/></button>
                            <button onClick={() => deleteHomepageAsset(asset.name)} className="p-2 bg-white/10 hover:bg-red-500 rounded-lg"><Trash2 size={16}/></button>
                         </div>
                         <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/40 backdrop-blur-sm">
                            <p className="text-[8px] font-bold truncate uppercase tracking-widest">{asset.name}</p>
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>
       )}
    </div>
  );

  return (
    <div className="flex flex-col font-sans">
      {/* HERO SECTION - REPLACED TABLET IMAGE WITH HIGH-END ARCHITECTURE/BUSINESS IMAGE */}
      <section className="relative h-[750px] flex items-center overflow-hidden no-print">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover" 
            alt="hs:results Results Redefined" 
          />
          {/* Subtle dark gradient overlay for text legibility and a premium feel */}
          <div className="absolute inset-0 bg-hs-blue/60 bg-gradient-to-r from-hs-blue/95 via-hs-blue/40 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
          <div className="max-w-3xl animate-reveal">
             <div className="flex items-center space-x-4 mb-6">
                <div className="h-[3px] w-12 bg-hs-orange"></div>
                <p className="text-hs-orange uppercase tracking-[0.4em] text-sm font-black drop-shadow-sm">{t('home.hero.prefix')}</p>
             </div>
             <h1 className="text-7xl md:text-[10rem] font-black text-white leading-[0.8] mb-12 tracking-tighter drop-shadow-2xl">
               Results <br/>
               <span className="text-hs-accent">Redefined.</span>
             </h1>
             <p className="text-xl md:text-2xl text-slate-100 font-medium leading-relaxed mb-12 max-w-2xl opacity-90">
               {t('home.hero.desc')}
             </p>
             <div className="flex flex-wrap gap-5">
                <button onClick={() => setView(ViewState.ORGANIZATION_ANALYZER)} className="bg-hs-orange text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-hs-blue transition-all shadow-2xl flex items-center group">
                   Intelligence Suite <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={18} />
                </button>
                <button onClick={() => {
                  const el = document.getElementById('consultants-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }} className="bg-white/10 backdrop-blur-md border-2 border-white/20 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-hs-blue transition-all shadow-xl">
                   Über hs:results
                </button>
             </div>
          </div>
        </div>
        
        {/* Floating Decorative Elements */}
        <div className="absolute bottom-12 right-12 hidden xl:block z-10 animate-fade-in delay-500">
           <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[3rem] shadow-2xl">
              <div className="flex items-center space-x-6">
                 <div className="w-16 h-16 rounded-3xl bg-hs-accent flex items-center justify-center text-white shadow-lg shadow-hs-accent/30">
                    <Zap size={32} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
                    <p className="text-white font-black text-lg uppercase tracking-tight">AI Integrated Advisory</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* LEAPCOACH BANNER */}
      <section className="bg-hs-blue py-10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-hs-orange font-black uppercase tracking-[0.3em] text-xs mb-2">{t('home.leapcoach.label')}</p>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">{t('home.leapcoach.title')}</h2>
            <p className="text-slate-200 max-w-2xl">{t('home.leapcoach.desc')}</p>
          </div>
          <a
            href="https://my.leapcoach.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-hs-orange text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-hs-blue transition-all shadow-xl whitespace-nowrap self-start md:self-auto"
          >
            {t('home.leapcoach.cta')}
          </a>
        </div>
      </section>

      {/* SOLUTIONS SECTION */}
      <section className="py-32 bg-slate-50 no-print">
        <div className="max-w-7xl mx-auto px-4 mb-20">
           <div className="flex items-center space-x-4 mb-4">
              <div className="h-[2px] w-12 bg-hs-orange"></div>
              <p className="text-hs-orange font-black uppercase tracking-[0.3em] text-sm">{t('home.portfolio.label')}</p>
           </div>
           <div className="max-w-4xl">
             <h2 className="text-4xl md:text-5xl font-black text-hs-blue uppercase tracking-tight leading-tight mb-6">
                {t('home.portfolio.title')}
             </h2>
             <p className="text-xl text-slate-600 leading-relaxed mb-8">
                {t('home.portfolio.desc')}
             </p>
           </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {solutionCards.map((card, idx) => (
             <div 
               key={idx} 
               onClick={() => setView(card.id)}
               className="bg-white rounded-[3rem] px-10 py-10 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group flex flex-col h-full overflow-hidden relative"
             >
                <div className={`w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-${card.accent} mb-8 group-hover:bg-hs-blue group-hover:text-white transition-all duration-500`}>
                   <card.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-hs-blue uppercase mb-3 tracking-tight group-hover:text-hs-orange transition-colors">{card.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow">{card.desc}</p>
                <div className="flex items-center text-[11px] font-black text-hs-blue uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                   {t('home.btn.audit_start')} <ArrowRight size={16} className="ml-2 text-hs-orange" />
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
                   <card.icon size={120} />
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* KUNDENSTIMMEN MARQUEE BANNER */}
      <section className="bg-slate-100 py-20 border-y border-slate-200 no-print overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-slate-100 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-slate-100 to-transparent z-10"></div>
        
        <div className="marquee-container">
          <div className="marquee-content animate-marquee flex items-stretch gap-12 px-12">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, idx) => (
              <div 
                key={idx} 
                className="flex-shrink-0 w-[400px] whitespace-normal bg-white border border-slate-100 p-10 rounded-[3.5rem] group hover:border-hs-orange transition-all flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="inline-flex p-4 bg-hs-orange/5 rounded-2xl mb-6">
                    <Quote className="text-hs-orange" size={28} />
                  </div>
                  <p className="text-hs-blue text-lg italic font-bold leading-relaxed mb-8">
                    "{testimonial.text}"
                  </p>
                </div>
                <div className="pt-6 border-t border-slate-100">
                  <p className="text-hs-orange font-black uppercase text-[12px] tracking-[0.2em] leading-tight">
                    {testimonial.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONSULTANTS SECTION */}
      <section id="consultants-section" className="py-32 bg-white no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
           <div>
             <div className="flex items-center space-x-4 mb-4">
                <div className="h-[2px] w-12 bg-hs-blue"></div>
                <p className="text-hs-blue font-black uppercase tracking-[0.3em] text-sm">Team Expertise</p>
             </div>
             <h2 className="text-6xl font-black text-hs-blue uppercase tracking-tighter">{t('home.title.consultants')}</h2>
           </div>
           {isAdmin && (
             <button 
               onClick={() => setShowAdmin(!showAdmin)}
               className={`text-[11px] font-black uppercase tracking-widest flex items-center transition-all px-8 py-4 rounded-2xl border ${showAdmin ? 'bg-hs-orange text-white border-hs-orange shadow-lg' : 'text-slate-300 border-slate-200 hover:text-hs-blue hover:border-hs-blue shadow-sm'}`}
             >
               <Database size={16} className="mr-2" /> {showAdmin ? 'Dashboard Schließen' : 'Backend Verwalten'}
             </button>
           )}
        </div>

        {showAdmin ? renderAdminDashboard() : (
           <>
              <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {displayedConsultants.map((c, i) => (
                  <div 
                    key={i} 
                    className="bg-slate-50 rounded-[4rem] p-12 flex flex-col items-center text-center group cursor-pointer hover:bg-white hover:shadow-[0_40px_100px_rgba(26,43,75,0.1)] transition-all border border-transparent hover:border-hs-accent/10 animate-fade-in" 
                    onClick={() => setSelectedConsultant(c)}
                  >
                    <div className="relative w-56 h-56 md:w-64 md:h-64 mb-10 flex-shrink-0">
                      <img 
                        src={c.img} 
                        alt={c.name} 
                        className="w-full h-full rounded-[2.5rem] object-cover shadow-2xl border-[12px] border-white group-hover:border-hs-accent transition-all duration-700" 
                        onError={(e) => e.currentTarget.src = `https://ui-avatars.com/api/?background=1a2b4b&color=fff&size=512&name=${encodeURIComponent(c.name)}`}
                      />
                      <div className="absolute -bottom-6 -right-6 bg-hs-orange text-white p-5 rounded-3xl shadow-2xl scale-0 group-hover:scale-100 transition-transform rotate-12 group-hover:rotate-0">
                        <Zap size={32} />
                      </div>
                    </div>
                    <div className="flex-grow pt-4">
                      <h3 className="text-4xl font-black text-hs-blue group-hover:text-hs-accent transition-colors mb-2 tracking-tight">{c.name}</h3>
                      <p className="text-[11px] text-hs-accent font-black mb-8 uppercase tracking-[0.4em]">{c.title}</p>
                      <p className="text-sm text-slate-500 italic font-medium leading-relaxed mb-10 line-clamp-3">"{c.intro}"</p>
                      <button className="bg-hs-blue text-white text-[10px] px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-hs-orange transition-all shadow-xl group-hover:scale-105">
                          {t('home.btn.profile_details')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {!showAllConsultants && consultants.length > featuredConsultants.length && (
                 <div className="max-w-7xl mx-auto px-4 mt-20 text-center">
                    <button 
                      onClick={() => setShowAllConsultants(true)}
                      className="inline-flex items-center space-x-4 bg-slate-100 text-hs-blue px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest hover:bg-hs-blue hover:text-white transition-all shadow-xl group"
                    >
                      <span>{t('home.btn.all_consultants')}</span>
                      <ChevronDown size={24} className="group-hover:translate-y-1 transition-transform" />
                    </button>
                 </div>
              )}
           </>
        )}
      </section>

      {/* SELECTED CONSULTANT MODAL */}
      {selectedConsultant && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-2xl p-4 animate-fade-in" onClick={() => setSelectedConsultant(null)}>
           <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden relative flex flex-col border border-white/20" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-10 bg-slate-50 border-b border-slate-100">
                 <div className="flex items-center">
                    <img 
                      src="https://firebasestorage.googleapis.com/v0/b/hs-results.firebasestorage.app/o/homepage_assets%2Flogo_hs_results.png?alt=media" 
                      alt="hs:results" 
                      className="h-10 w-auto"
                    />
                 </div>
                 <div className="flex items-center space-x-6 no-print">
                    <button onClick={() => handleDownloadProfile(selectedConsultant)} className="flex items-center text-xs font-black text-slate-500 hover:text-hs-blue transition-colors uppercase tracking-[0.2em]">
                       <Download size={20} className="mr-3 text-hs-orange" /> Profile
                    </button>
                    <button onClick={() => window.print()} className="flex items-center text-xs font-black text-slate-500 hover:text-hs-blue transition-colors uppercase tracking-[0.2em]">
                       <Printer size={20} className="mr-3 text-hs-blue" /> {language === 'de' ? 'Drucken' : 'Print'}
                    </button>
                    <button onClick={() => setSelectedConsultant(null)} className="p-4 bg-slate-200 text-slate-500 hover:bg-red-500 hover:text-white rounded-full transition-all">
                       <X size={28} />
                    </button>
                 </div>
              </div>

              <div className="flex-grow overflow-y-auto flex flex-col lg:flex-row">
                 <div className="lg:w-[35%] bg-slate-50/50 p-16 text-center border-r border-slate-100 flex flex-col items-center">
                    <div className="w-72 h-72 rounded-[3rem] overflow-hidden shadow-2xl mb-12 ring-[16px] ring-white">
                       <img src={selectedConsultant.img} alt={selectedConsultant.name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = `https://ui-avatars.com/api/?background=1a2b4b&color=fff&size=512&name=${encodeURIComponent(selectedConsultant.name)}`} />
                    </div>
                    <h2 className="text-5xl font-black text-hs-blue uppercase mb-3 tracking-tighter leading-none">{selectedConsultant.name}</h2>
                    <p className="text-hs-accent font-black text-xs uppercase tracking-[0.3em] mb-12">{selectedConsultant.title}</p>
                    <div className="w-full space-y-6 text-left border-t border-slate-200 pt-12">
                       <div className="flex items-center text-sm font-bold text-slate-600"><Mail size={18} className="mr-5 text-hs-orange" /> {selectedConsultant.email}</div>
                       <div className="flex items-center text-sm font-bold text-slate-600"><Phone size={18} className="mr-5 text-hs-blue" /> {selectedConsultant.phone}</div>
                       <div className="flex items-center text-sm font-bold text-slate-600"><MapPin size={18} className="mr-5 text-hs-blue" /> {selectedConsultant.address}</div>
                    </div>
                 </div>
                 <div className="lg:w-[65%] p-20 space-y-20">
                    <div>
                       <h3 className="text-[11px] font-black text-hs-accent uppercase tracking-[0.4em] mb-8">Personal Mission</h3>
                       <p className="text-4xl font-bold text-hs-blue leading-tight italic">"{selectedConsultant.intro}"</p>
                    </div>
                    <div className="grid grid-cols-2 gap-16">
                       <div>
                          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Top Expertise</h4>
                          <ul className="space-y-6">
                             {selectedConsultant.focus.map((f, i) => <li key={i} className="text-md font-bold text-slate-700 flex items-start"><CheckCircle2 size={20} className="mr-4 text-emerald-500 mt-0.5 flex-shrink-0" /> {f}</li>)}
                          </ul>
                       </div>
                       <div>
                          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Key Projects</h4>
                          <ul className="space-y-6">
                             {selectedConsultant.projects.map((p, i) => <li key={i} className="text-md text-slate-600 font-medium flex items-start"><div className="w-2 h-2 rounded-full bg-hs-orange mt-2.5 mr-5 flex-shrink-0" /> {p}</li>)}
                          </ul>
                       </div>
                    </div>
                    
                    <div className="bg-hs-blue text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                       <div className="relative z-10">
                          <h4 className="text-[11px] font-black text-hs-accent uppercase tracking-[0.4em] mb-6">Select Customers</h4>
                          <div className="flex flex-wrap gap-4">
                             {selectedConsultant.customers.map((c, i) => (
                               <span key={i} className="px-5 py-2 bg-white/10 border border-white/20 rounded-xl text-xs font-bold uppercase tracking-widest">{c}</span>
                             ))}
                          </div>
                       </div>
                       <Sparkles size={120} className="absolute -bottom-10 -right-10 text-white/5 group-hover:scale-125 transition-transform duration-700" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const getTranslatedDefaultConsultants = (lang: string): ConsultantProfile[] => {
  return [
    { 
      name: "Olaf Heger", 
      title: lang === 'en' ? "Org Developer & Innovation Expert" : "Unternehmensentwickler & Innovationsexperte", 
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800", 
      email: "olafheger@hs-results.com", 
      phone: "+49 173 527 72 27", 
      address: "Weyerstr. 1, 45131 Essen",
      intro: lang === 'en' ? "Innovation expert and business coach with a focus on modern organizational forms." : "Unternehmensentwickler, Innovationsexperte und Business-Coach mit Fokus on moderne Organisationsformen.",
      focus: ["Einführung moderner Organisationsformen", "AI First-Mover", "Startup-Entwickler"],
      background: ["MA (Univ. Essen)", "Interner Berater Personalentwicklung (Audi AG)"],
      projects: ["Konzernweites Change-Driver-System", "Aufbau von Startups"],
      customers: ["BASF", "Lufthansa", "Siemens Healthineers", "DHL"]
    },
    { 
      name: "Andre Stuer", 
      title: "Co-Founder hs:results", 
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=800", 
      email: "stuer@hs-results.com", 
      phone: "+49 160 823 41 41", 
      address: "Immenseestraße 10, 14471 Potsdam",
      intro: lang === 'en' ? "Expert in strategy development and organizational design." : "Experte für Strategieentwicklung und Organisationsdesign mit Leidenschaft für messbare Ergebnisse.",
      focus: ["Strategie-Klarheit", "Organisationsdesign", "Operational Excellence"],
      background: ["Internationaler Strategieberater", "Lean Management Experte"],
      projects: ["Vertriebsstrategie Hidden Champion", "Reorganisation Handel"],
      customers: ["Volkswagen", "Lufthansa", "Metro AG"]
    }
  ];
};
