import React from 'react';
import { ViewState } from '../types';
import { 
  ChevronLeft, Clock, Zap, Target, RefreshCw, MessageSquare, 
  CheckCircle2, Laptop, GraduationCap, Video, Users
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MicrotrainingsProps {
  setView: (view: ViewState) => void;
}

export const Microtrainings: React.FC<MicrotrainingsProps> = ({ setView }) => {
  const { t } = useLanguage();

  const advantages = [
    {
      title: t('sol.micro.adv1.title'),
      desc: t('sol.micro.adv1.desc'),
      icon: Clock,
      accent: "hs-accent"
    },
    {
      title: t('sol.micro.adv2.title'),
      desc: t('sol.micro.adv2.desc'),
      icon: Zap,
      accent: "hs-orange"
    },
    {
      title: t('sol.micro.adv3.title'),
      desc: t('sol.micro.adv3.desc'),
      icon: RefreshCw,
      accent: "hs-blue"
    },
    {
      title: t('sol.micro.adv4.title'),
      desc: t('sol.micro.adv4.desc'),
      icon: MessageSquare,
      accent: "emerald-500"
    }
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button 
          onClick={() => setView(ViewState.HOME)} 
          className="mb-10 flex items-center text-slate-400 hover:text-hs-blue transition-colors font-black uppercase text-xs tracking-widest no-print"
        >
          <ChevronLeft size={16} className="mr-1" /> {t('ui.back')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center space-x-4 mb-2">
              <div className="h-[3px] w-16 bg-hs-orange"></div>
              <p className="text-hs-orange font-black uppercase tracking-[0.3em] text-sm">Lernkonzepte</p>
            </div>
            <h1 className="text-6xl font-black text-hs-blue uppercase tracking-tight leading-[0.95]">
              {t('sol.micro.title')}
            </h1>
            <p className="text-2xl font-bold text-hs-accent leading-tight">
              {t('sol.micro.subtitle')}
            </p>
            
            <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
              <p>
                {t('sol.micro.intro')}
              </p>
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border-l-8 border-hs-orange shadow-sm">
                <p className="italic font-bold text-hs-blue leading-relaxed">
                  "{t('sol.micro.quote')}"
                </p>
              </div>
              <p>
                {t('sol.micro.footer')}
              </p>
            </div>
          </div>

          <div className="relative group animate-fade-in" style={{ animationDelay: '200ms' }}>
            <img 
              src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&q=80&w=1200" 
              className="rounded-[3rem] shadow-2xl z-10 relative group-hover:scale-[1.02] transition-transform duration-700" 
              alt="Remote Learning Workspace" 
            />
            <div className="absolute -bottom-8 -right-8 w-full h-full border-4 border-hs-orange/30 rounded-[3rem] -z-10 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-700"></div>
            
            <div className="absolute -top-10 -left-10 bg-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center text-hs-blue border border-slate-100 hidden md:flex">
               <Laptop size={48} className="mb-2 text-hs-accent" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hybrid Skills</span>
            </div>
          </div>
        </div>

        {/* Advantages Grid */}
        <div className="mb-32">
          <div className="flex items-center space-x-4 mb-12">
            <h2 className="text-3xl font-black text-hs-blue uppercase tracking-tight">{t('sol.micro.adv')}</h2>
            <div className="flex-grow h-[1px] bg-slate-100"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((adv, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-${adv.accent} mb-8 group-hover:bg-hs-blue group-hover:text-white transition-all duration-500 shadow-inner`}>
                  <adv.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-hs-blue uppercase mb-4 tracking-tight group-hover:text-hs-orange transition-colors">{adv.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quote & Final Image Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-2 bg-hs-blue text-white p-16 rounded-[4rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <GraduationCap size={160} />
            </div>
            <div className="relative z-10">
              <div className="text-hs-orange font-black text-5xl mb-8">“</div>
              <p className="text-3xl md:text-4xl font-bold leading-[1.1] mb-8">
                {t('sol.micro.main_quote')}
              </p>
              <div className="flex items-center space-x-4">
                 <div className="w-12 h-[2px] bg-hs-accent"></div>
                 <p className="text-hs-accent font-black uppercase tracking-widest text-xs">hs:results Expertise</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100">
              <div className="flex items-center space-x-4 mb-4">
                <Video className="text-hs-orange" />
                <h4 className="font-black text-hs-blue uppercase text-xs">{t('sol.micro.live')}</h4>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {t('sol.micro.live_desc')}
              </p>
            </div>
            <div className="rounded-[3rem] overflow-hidden shadow-xl aspect-square">
              <img 
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-full object-cover" 
                alt="Professional collaboration" 
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};