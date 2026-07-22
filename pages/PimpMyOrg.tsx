import React from 'react';
import { ViewState } from '../types';
import { 
  ChevronLeft, Rocket, Users, MessageSquare, ShieldAlert, 
  FlaskConical, CheckCircle2, Calendar, Layout, Zap, Globe, Cpu
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PimpMyOrgProps {
  setView: (view: ViewState) => void;
}

export const PimpMyOrg: React.FC<PimpMyOrgProps> = ({ setView }) => {
  const { t } = useLanguage();

  const processSteps = [
    { title: t('sol.pimp.step1.title'), desc: t('sol.pimp.step1.desc'), icon: Rocket, accent: "hs-blue" },
    { title: t('sol.pimp.step2.title'), desc: t('sol.pimp.step2.desc'), icon: Users, accent: "hs-orange" },
    { title: t('sol.pimp.step3.title'), desc: t('sol.pimp.step3.desc'), icon: MessageSquare, accent: "hs-accent" },
    { title: t('sol.pimp.step4.title'), desc: t('sol.pimp.step4.desc'), icon: ShieldAlert, accent: "red-500" },
    { title: t('sol.pimp.step5.title'), desc: t('sol.pimp.step5.desc'), icon: Zap, accent: "hs-orange" },
    { title: t('sol.pimp.step6.title'), desc: t('sol.pimp.step6.desc'), icon: FlaskConical, accent: "hs-blue" },
    { title: t('sol.pimp.step7.title'), desc: t('sol.pimp.step7.desc'), icon: CheckCircle2, accent: "emerald-500" }
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <button 
          onClick={() => setView(ViewState.HOME)} 
          className="mb-10 flex items-center text-slate-400 hover:text-hs-blue transition-colors font-black uppercase text-xs tracking-widest no-print"
        >
          <ChevronLeft size={16} className="mr-1" /> {t('ui.back')}
        </button>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center space-x-4 mb-2">
              <div className="h-[3px] w-16 bg-hs-orange"></div>
              <p className="text-hs-orange font-black uppercase tracking-[0.3em] text-sm">{t('sol.pimp.subtitle')}</p>
            </div>
            <h1 className="text-6xl font-black text-hs-blue uppercase tracking-tight leading-[0.95]">
              {t('sol.pimp.title')}
            </h1>
            <p className="text-2xl font-bold text-hs-accent leading-tight italic">
              {t('sol.pimp.intro')}
              <br/><span className="text-hs-orange not-italic">{t('sol.pimp.intro_sub')}</span>
            </p>
            
            <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
              <p>
                {t('sol.pimp.text')}
              </p>
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border-l-8 border-hs-orange shadow-sm">
                <p className="italic font-bold text-hs-blue leading-relaxed">
                  "{t('sol.pimp.highlight')}"
                </p>
              </div>
              <p className="font-bold text-hs-blue">
                {t('sol.pimp.text2')}
              </p>
            </div>
          </div>

          <div className="relative group animate-fade-in" style={{ animationDelay: '200ms' }}>
            <img 
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=1200" 
              className="rounded-[3rem] shadow-2xl z-10 relative group-hover:scale-[1.02] transition-transform duration-700" 
              alt="Team collaborating on whiteboard" 
            />
            <div className="absolute -bottom-8 -right-8 w-full h-full border-4 border-hs-orange/30 rounded-[3rem] -z-10 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-700"></div>
            
            <div className="absolute -top-10 -left-10 bg-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center text-hs-blue border border-slate-100 hidden md:flex">
               <Calendar size={48} className="mb-2 text-hs-accent" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">6 Months Roadmap</span>
            </div>
          </div>
        </div>

        {/* Process Roadmap */}
        <div className="mb-32">
          <div className="flex items-center space-x-4 mb-12">
            <h2 className="text-3xl font-black text-hs-blue uppercase tracking-tight">{t('sol.pimp.roadmap')}</h2>
            <div className="flex-grow h-[1px] bg-slate-100"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all group relative overflow-hidden"
              >
                <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-${step.accent} mb-8 group-hover:bg-hs-blue group-hover:text-white transition-all duration-500 shadow-inner`}>
                  <step.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-hs-blue uppercase mb-4 tracking-tight group-hover:text-hs-orange transition-colors">{step.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{step.desc}</p>
                <div className="absolute -bottom-4 -right-4 text-slate-50 font-black text-8xl -z-10 group-hover:text-slate-100 transition-colors">
                  {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topics & Philosophy */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start mb-24">
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-hs-blue text-white p-12 rounded-[4rem] relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Layout size={200} />
               </div>
               <h3 className="text-2xl font-black uppercase mb-8 flex items-center">
                  <Globe className="mr-3 text-hs-orange" /> {t('sol.pimp.topics')}
               </h3>
               <p className="text-slate-300 mb-10 leading-relaxed text-lg">
                  {t('sol.pimp.topics_desc')}
               </p>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center group hover:bg-white/10 transition-colors">
                     <Cpu className="mx-auto mb-4 text-hs-accent" size={32} />
                     <span className="font-bold uppercase text-xs tracking-widest">{t('sol.pimp.topic1')}</span>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center group hover:bg-white/10 transition-colors">
                     <Zap className="mx-auto mb-4 text-hs-orange" size={32} />
                     <span className="font-bold uppercase text-xs tracking-widest">{t('sol.pimp.topic2')}</span>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center group hover:bg-white/10 transition-colors">
                     <Globe className="mx-auto mb-4 text-hs-accent" size={32} />
                     <span className="font-bold uppercase text-xs tracking-widest">{t('sol.pimp.topic3')}</span>
                  </div>
               </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="rounded-[3rem] overflow-hidden shadow-xl aspect-square border-4 border-hs-accent">
              <img 
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-full object-cover" 
                alt="Technology and People" 
              />
            </div>
            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 text-center relative overflow-hidden">
               <div className="text-hs-orange text-5xl font-serif mb-4 leading-none">“</div>
               <p className="text-xl font-bold text-hs-blue leading-tight mb-6">
                  {t('sol.pimp.quote')}
               </p>
               <div className="w-12 h-[2px] bg-hs-accent mx-auto mb-2"></div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">hs:results Philosophy</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};