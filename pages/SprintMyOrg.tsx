import React from 'react';
import { ViewState } from '../types';
import { 
  ChevronLeft, Timer, ShieldAlert, Target, Lightbulb, 
  CheckCircle, Boxes, Zap, ArrowRight, Layers, Trash2, Search
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SprintMyOrgProps {
  setView: (view: ViewState) => void;
}

export const SprintMyOrg: React.FC<SprintMyOrgProps> = ({ setView }) => {
  const { t } = useLanguage();

  const sprintSteps = [
    { title: t('sol.sprint.step1.title'), desc: t('sol.sprint.step1.desc'), icon: Search, color: "hs-blue" },
    { title: t('sol.sprint.step2.title'), desc: t('sol.sprint.step2.desc'), icon: Target, color: "hs-orange" },
    { title: t('sol.sprint.step3.title'), desc: t('sol.sprint.step3.desc'), icon: Lightbulb, color: "hs-accent" },
    { title: t('sol.sprint.step4.title'), desc: t('sol.sprint.step4.desc'), icon: CheckCircle, color: "emerald-500" },
    { title: t('sol.sprint.step5.title'), desc: t('sol.sprint.step5.desc'), icon: Boxes, color: "hs-orange" }
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center space-x-4 mb-2">
              <div className="h-[3px] w-16 bg-hs-orange"></div>
              <p className="text-hs-orange font-black uppercase tracking-[0.3em] text-sm">{t('sol.sprint.subtitle')}</p>
            </div>
            <h1 className="text-6xl font-black text-hs-blue uppercase tracking-tight leading-[0.95]">
              {t('sol.sprint.title')}
            </h1>
            <p className="text-2xl font-bold text-hs-accent leading-tight italic">
              {t('sol.sprint.intro')}
              <br/><span className="text-hs-orange not-italic">{t('sol.sprint.intro_sub')}</span>
            </p>
            
            <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
              <p>
                {t('sol.sprint.text')}
              </p>
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border-l-8 border-hs-blue shadow-sm">
                <p className="font-bold text-hs-blue leading-relaxed">
                  {t('sol.sprint.highlight')}
                </p>
              </div>
            </div>
          </div>

          <div className="relative group animate-fade-in" style={{ animationDelay: '200ms' }}>
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200" 
              className="rounded-[3rem] shadow-2xl z-10 relative group-hover:scale-[1.02] transition-transform duration-700" 
              alt="Team Workshop Sprint" 
            />
            <div className="absolute -bottom-8 -right-8 w-full h-full border-4 border-hs-orange/30 rounded-[3rem] -z-10 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-700"></div>
            
            <div className="absolute -top-10 -left-10 bg-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center text-hs-blue border border-slate-100 hidden md:flex">
               <Timer size={48} className="mb-2 text-hs-orange" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">5 Days Only</span>
            </div>
          </div>
        </div>

        {/* The 5-Day Model */}
        <div className="mb-32">
          <div className="flex items-center space-x-4 mb-12">
            <h2 className="text-3xl font-black text-hs-blue uppercase tracking-tight">{t('sol.sprint.format')}</h2>
            <div className="flex-grow h-[1px] bg-slate-100"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {sprintSteps.map((step, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all group flex flex-col items-center text-center"
              >
                <div className={`w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-${step.color} mb-6 group-hover:bg-hs-blue group-hover:text-white transition-all duration-500`}>
                  <step.icon size={24} />
                </div>
                <h3 className="text-sm font-black text-hs-blue uppercase mb-2 tracking-tight">{step.title}</h3>
                <p className="text-slate-500 text-[11px] font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-8 bg-hs-blue rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between shadow-xl">
             <div className="flex items-center space-x-6 mb-6 md:mb-0">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                   <Zap className="text-hs-orange" size={32} />
                </div>
                <div>
                   <h4 className="text-xl font-black uppercase tracking-tight">{t('sol.sprint.impact')}</h4>
                   <p className="text-slate-300 text-sm italic">{t('sol.sprint.impact_desc')}</p>
                </div>
             </div>
             <div className="flex space-x-4">
                <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest">{t('sol.sprint.btn1')}</div>
                <div className="px-6 py-3 bg-hs-orange rounded-full text-xs font-black uppercase tracking-widest shadow-lg">{t('sol.sprint.btn2')}</div>
             </div>
          </div>
        </div>

        {/* Bottom Section: Quote & Examples */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-slate-50 p-12 rounded-[4rem] relative overflow-hidden border border-slate-100">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <ShieldAlert size={200} />
               </div>
               <h3 className="text-2xl font-black text-hs-blue uppercase mb-8 flex items-center">
                  <Layers className="mr-3 text-hs-orange" /> {t('sol.sprint.topics')}
               </h3>
               <p className="text-slate-600 mb-8 leading-relaxed">
                  {t('sol.sprint.topics_desc')}
               </p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                     <span className="w-10 h-10 rounded-full bg-hs-blue text-white flex items-center justify-center font-black">A</span>
                     <span className="font-bold text-hs-blue">{t('sol.sprint.topic1')}</span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                     <span className="w-10 h-10 rounded-full bg-hs-accent text-white flex items-center justify-center font-black">M</span>
                     <span className="font-bold text-hs-blue">{t('sol.sprint.topic2')}</span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                     <span className="w-10 h-10 rounded-full bg-hs-blue text-white flex items-center justify-center font-black">G</span>
                     <span className="font-bold text-hs-blue">{t('sol.sprint.topic3')}</span>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                     <span className="w-10 h-10 rounded-full bg-hs-orange text-white flex items-center justify-center font-black">Z</span>
                     <span className="font-bold text-hs-blue">{t('sol.sprint.topic4')}</span>
                  </div>
               </div>
            </div>
          </div>
          
          <div className="bg-hs-blue text-white p-12 rounded-[3rem] shadow-2xl flex flex-col h-full justify-center text-center relative overflow-hidden">
             <div className="absolute -bottom-10 -left-10 text-white/5">
                <Lightbulb size={240} />
             </div>
             <div className="relative z-10">
                <div className="text-hs-orange text-6xl font-serif mb-6 leading-none">“</div>
                <p className="text-2xl font-bold leading-tight mb-8">
                   {t('sol.sprint.quote')}
                </p>
                <div className="w-12 h-[2px] bg-hs-accent mx-auto mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-hs-accent">hs:results Philosophie</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};