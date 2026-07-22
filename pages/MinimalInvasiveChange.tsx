import React from 'react';
import { ViewState } from '../types';
import { 
  ChevronLeft, Target, Users, FlaskConical, ZoomIn, Share2, 
  AlertCircle, ShieldCheck, Microscope, Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface MinimalInvasiveChangeProps {
  setView: (view: ViewState) => void;
}

export const MinimalInvasiveChange: React.FC<MinimalInvasiveChangeProps> = ({ setView }) => {
  const { t } = useLanguage();

  const advantages = [
    {
      title: t('sol.invasive.adv1.title'),
      desc: t('sol.invasive.adv1.desc'),
      icon: Microscope,
      accent: "hs-accent"
    },
    {
      title: t('sol.invasive.adv2.title'),
      desc: t('sol.invasive.adv2.desc'),
      icon: Target,
      accent: "hs-orange"
    },
    {
      title: t('sol.invasive.adv3.title'),
      desc: t('sol.invasive.adv3.desc'),
      icon: FlaskConical,
      accent: "hs-blue"
    },
    {
      title: t('sol.invasive.adv4.title'),
      desc: t('sol.invasive.adv4.desc'),
      icon: ZoomIn,
      accent: "emerald-500"
    },
    {
      title: t('sol.invasive.adv5.title'),
      desc: t('sol.invasive.adv5.desc'),
      icon: Share2,
      accent: "hs-accent"
    },
    {
      title: t('sol.invasive.adv6.title'),
      desc: t('sol.invasive.adv6.desc'),
      icon: AlertCircle,
      accent: "hs-orange"
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
              <p className="text-hs-orange font-black uppercase tracking-[0.3em] text-sm">{t('sol.invasive.subtitle')}</p>
            </div>
            <h1 className="text-6xl font-black text-hs-blue uppercase tracking-tight leading-[0.95]">
              {t('sol.invasive.title').split(' ').join('\n')}
            </h1>
            <p className="text-2xl font-bold text-hs-accent leading-tight">
              {t('sol.invasive.intro')}
            </p>
            
            <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
              <p className="italic">
                {t('sol.invasive.intro_sub')}
              </p>
              <div className="bg-hs-blue/5 p-8 rounded-[2.5rem] border-l-8 border-hs-blue shadow-sm">
                <p className="font-bold text-hs-blue leading-relaxed">
                  {t('sol.invasive.highlight')}
                </p>
              </div>
            </div>
          </div>

          <div className="relative group animate-fade-in" style={{ animationDelay: '200ms' }}>
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200" 
              className="rounded-[3rem] shadow-2xl z-10 relative group-hover:scale-[1.02] transition-transform duration-700" 
              alt="Medical precision / High-tech lab" 
            />
            <div className="absolute -bottom-8 -right-8 w-full h-full border-4 border-hs-accent/30 rounded-[3rem] -z-10 group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-700"></div>
            
            <div className="absolute -top-10 -right-10 bg-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center text-hs-blue border border-slate-100 hidden md:flex">
               <ShieldCheck size={48} className="mb-2 text-emerald-500" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zero Side Effects</span>
            </div>
          </div>
        </div>

        {/* Advantages Grid */}
        <div className="mb-32">
          <div className="flex items-center space-x-4 mb-12">
            <h2 className="text-3xl font-black text-hs-blue uppercase tracking-tight">{t('sol.micro.adv')}</h2>
            <div className="flex-grow h-[1px] bg-slate-100"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advantages.map((adv, idx) => (
              <div 
                key={idx} 
                className="bg-slate-50 rounded-[2.5rem] p-10 shadow-sm border border-transparent hover:border-hs-orange hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-${adv.accent} mb-8 group-hover:bg-hs-blue group-hover:text-white transition-all duration-500 shadow-sm`}>
                  <adv.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-hs-blue uppercase mb-4 tracking-tight group-hover:text-hs-orange transition-colors">{adv.title}</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quote & Image Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="space-y-8">
            <div className="rounded-[3rem] overflow-hidden shadow-xl aspect-square border-4 border-hs-orange">
              <img 
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-full object-cover" 
                alt="Focused small team collaboration" 
              />
            </div>
            <div className="bg-hs-accent p-8 rounded-[3rem] text-white">
              <div className="flex items-center space-x-4 mb-4">
                <Sparkles size={24} />
                <h4 className="font-black uppercase text-xs">{t('sol.invasive.agile')}</h4>
              </div>
              <p className="text-xs font-bold leading-relaxed">
                {t('sol.invasive.agile_desc')}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-hs-blue text-white p-16 rounded-[4rem] shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-20 -left-20 opacity-5">
              <Users size={400} />
            </div>
            <div className="relative z-10">
              <div className="text-hs-orange font-black text-6xl mb-8">“</div>
              <p className="text-4xl md:text-5xl font-bold leading-[1.1] mb-10">
                {t('sol.invasive.quote')}
              </p>
              <div className="flex items-center space-x-4">
                 <div className="w-12 h-[2px] bg-hs-accent"></div>
                 <p className="text-hs-accent font-black uppercase tracking-widest text-xs">Strategische Individualität</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};