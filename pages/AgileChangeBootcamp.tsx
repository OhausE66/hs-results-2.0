import React from 'react';
import { ViewState } from '../types';
import { 
  ChevronLeft, Flame, Zap, Users, Target, ShieldCheck, 
  FlaskConical, Globe, MessageSquare, Award, PlayCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AgileChangeBootcampProps {
  setView: (view: ViewState) => void;
}

export const AgileChangeBootcamp: React.FC<AgileChangeBootcampProps> = ({ setView }) => {
  const { t } = useLanguage();

  const curriculum = [
    { title: t('sol.bootcamp.mod1'), icon: Zap, accent: "hs-orange" },
    { title: t('sol.bootcamp.mod2'), icon: Globe, accent: "hs-blue" },
    { title: t('sol.bootcamp.mod3'), icon: Target, accent: "hs-accent" },
    { title: t('sol.bootcamp.mod4'), icon: ShieldCheck, accent: "emerald-500" },
    { title: t('sol.bootcamp.mod5'), icon: MessageSquare, accent: "hs-orange" },
    { title: t('sol.bootcamp.mod6'), icon: FlaskConical, accent: "hs-blue" },
    { title: t('sol.bootcamp.mod7'), icon: Users, accent: "hs-accent" }
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
              <p className="text-hs-orange font-black uppercase tracking-[0.3em] text-sm">{t('sol.bootcamp.subtitle')}</p>
            </div>
            <h1 className="text-6xl font-black text-hs-blue uppercase tracking-tight leading-[0.95]">
              {t('sol.bootcamp.title').split(' ').slice(0, 2).join(' ')}<br/>{t('sol.bootcamp.title').split(' ').slice(2).join(' ')}
            </h1>
            <p className="text-2xl font-bold text-hs-accent leading-tight italic">
              {t('sol.bootcamp.intro')}
              <br/><span className="text-hs-orange not-italic">{t('sol.bootcamp.intro_sub')}</span>
            </p>
            
            <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
              <p>
                {t('sol.bootcamp.text')}
              </p>
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border-l-8 border-hs-blue shadow-sm">
                <p className="font-bold text-hs-blue leading-relaxed">
                  {t('sol.bootcamp.highlight')}
                </p>
              </div>
              <p className="text-sm font-medium">
                {t('sol.bootcamp.text2')}
              </p>
            </div>
          </div>

          <div className="relative group animate-fade-in" style={{ animationDelay: '200ms' }}>
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200" 
              className="rounded-[3rem] shadow-2xl z-10 relative group-hover:scale-[1.02] transition-transform duration-700" 
              alt="Intense team collaboration" 
            />
            <div className="absolute -bottom-8 -right-8 w-full h-full border-4 border-hs-orange/30 rounded-[3rem] -z-10 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-700"></div>
            
            <div className="absolute -top-10 -right-10 bg-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center text-hs-blue border border-slate-100 hidden md:flex">
               <Flame size={48} className="mb-2 text-hs-orange animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">High Intensity</span>
            </div>
          </div>
        </div>

        {/* Content & Modules */}
        <div className="mb-32">
          <div className="flex items-center space-x-4 mb-12">
            <h2 className="text-3xl font-black text-hs-blue uppercase tracking-tight">{t('sol.bootcamp.curriculum')}</h2>
            <div className="flex-grow h-[1px] bg-slate-100"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {curriculum.map((item, idx) => (
              <div 
                key={idx} 
                className="bg-slate-50 rounded-[2rem] p-6 shadow-sm border border-transparent hover:border-hs-orange hover:bg-white transition-all group flex flex-col items-center text-center"
              >
                <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center text-${item.accent} mb-4 group-hover:bg-hs-blue group-hover:text-white transition-all duration-500 shadow-sm`}>
                  <item.icon size={24} />
                </div>
                <h3 className="text-[10px] font-black text-hs-blue uppercase tracking-tight">{item.title}</h3>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-hs-blue text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Award size={200} />
             </div>
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                <div className="lg:col-span-2">
                   <h4 className="text-2xl font-black uppercase mb-4 text-hs-orange">{t('sol.bootcamp.impact_title')}</h4>
                   <p className="text-4xl font-bold leading-tight mb-6">
                      {t('sol.bootcamp.impact_main')}
                   </p>
                   <p className="text-slate-300">
                      {t('sol.bootcamp.impact_desc')}
                   </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 text-center backdrop-blur-sm">
                   <p className="text-xs uppercase font-black tracking-widest text-hs-accent mb-2">Duration</p>
                   <p className="text-5xl font-black">3</p>
                   <p className="text-sm font-bold uppercase">{t('sol.bootcamp.duration')}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Closing Image & Quote */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="space-y-8">
            <div className="rounded-[3rem] overflow-hidden shadow-xl aspect-square border-4 border-hs-accent">
              <img 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-full object-cover" 
                alt="Practical experiment" 
              />
            </div>
            <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100">
               <h4 className="font-black text-xs uppercase mb-2 flex items-center"><PlayCircle size={14} className="mr-2 text-hs-orange"/> {t('sol.bootcamp.method')}</h4>
               <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  {t('sol.bootcamp.method_desc')}
               </p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-hs-orange text-white p-16 rounded-[4rem] shadow-2xl relative overflow-hidden text-center lg:text-left">
            <div className="absolute -bottom-20 -right-20 opacity-5">
              <Flame size={400} />
            </div>
            <div className="relative z-10">
              <div className="text-hs-blue font-black text-6xl mb-8 leading-none">“</div>
              <p className="text-4xl md:text-5xl font-bold leading-[1.1] mb-10">
                {t('sol.bootcamp.quote')}
              </p>
              <div className="flex items-center justify-center lg:justify-start space-x-4">
                 <div className="w-12 h-[2px] bg-hs-blue"></div>
                 <p className="text-hs-blue font-black uppercase tracking-widest text-xs">Unternehmenskulturelle Vision</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};