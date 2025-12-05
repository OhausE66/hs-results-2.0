import React from 'react';
import { ViewState } from '../types';
import { Plus, Brain, Target, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface HomeProps {
  setView: (view: ViewState) => void;
}

export const Home: React.FC<HomeProps> = ({ setView }) => {
  
  const solutions = [
    {
      title: "ORGANISATION",
      desc: "Agil, hierarchisch oder hybrid?",
      icon: "org",
      interactive: false
    },
    {
      title: "STRATEGIE",
      desc: "Viele Wege führen zu unternehmerischem Erfolg.",
      icon: "strat",
      interactive: false
    },
    {
      title: "KULTUR",
      desc: "Die Unternehmenskultur macht einen Unterschied.",
      icon: "cult",
      interactive: false
    },
    {
      title: "FÜHRUNG",
      desc: "Ein wichtiger Stellhebel zur Sicherung der Zukunftsfähigkeit.",
      icon: "lead",
      interactive: true,
      target: ViewState.LEADERSHIP_RADAR,
      badge: "AI Powered Radar"
    },
    {
      title: "VERÄNDERUNG",
      desc: "Herausforderungen annehmen, aktuelle Chancen ergreifen.",
      icon: "change",
      interactive: true,
      target: ViewState.CHANGE_MANAGER,
      badge: "AI Consultant"
    },
    {
      title: "DIGITALE TRANSFORMATION",
      desc: "Technologische Entwicklungen und Innovationen nutzen.",
      icon: "digi",
      interactive: false
    }
  ];

  const consultants = [
    { img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400", name: "Dr. Maria Weber" },
    { img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400", name: "Thomas Klein" },
    { img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400", name: "Andre Stuer" },
    { img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400", name: "Olaf Heger" }
  ];

  return (
    <div className="flex flex-col font-sans">
      
      {/* HERO SECTION */}
      <section className="relative h-[600px] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1920" 
            alt="Meeting" 
            className="w-full h-full object-cover"
          />
          {/* White/Light overlay gradient similar to screenshot */}
          <div className="absolute inset-0 bg-white/70 bg-gradient-to-r from-white/90 via-white/60 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
          <p className="text-slate-600 uppercase tracking-widest text-sm font-semibold mb-2">Unser Ansatz:</p>
          <h1 className="text-6xl md:text-7xl font-bold text-hs-blue leading-tight mb-8">
            Das<br/>Ergebnis<br/>zählt.
          </h1>
          {/* Tablet/Device Image Overlay could go here if we had the transparent asset, simulating it roughly or skipping */}
        </div>
      </section>

      {/* INTRO TEXT SECTION */}
      <section className="py-20 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-hs-blue mb-6">
            Erfahren. Individuell. Innovativ. Wirkungsvoll.
          </h2>
          <p className="text-slate-600 leading-relaxed text-lg">
            hs:results unterstützt Organisationen und Führungskräfte bei der Entwicklung und Umsetzung erfolgskritischer Veränderungsvorhaben. 
            Das Team von erfahrenen Beratern gestaltet für Sie individuelle, innovative Prozesse und erzielt damit schnellere und wirkungsvolle Resultate.
            <br/><br/>
            <strong className="text-hs-blue block text-xl mt-4">Unser Ansatz: Das Ergebnis zählt</strong>
            <strong className="text-hs-blue block text-xl mt-1">Unser Ziel: Sichtbare Erfolge</strong>
          </p>
        </div>
      </section>

      {/* SOLUTIONS GRID */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((sol, idx) => (
              <div 
                key={idx} 
                onClick={() => sol.interactive && sol.target && setView(sol.target)}
                className={`relative bg-slate-100 p-8 h-80 flex flex-col justify-between transition-all group ${sol.interactive ? 'cursor-pointer hover:shadow-xl hover:bg-white border-2 border-transparent hover:border-hs-accent' : ''}`}
              >
                <div>
                   {/* Icons (Simplified visuals based on screenshot style) */}
                   <div className="mb-6 text-hs-blue">
                      {sol.icon === 'org' && <div className="w-12 h-12 border-2 border-hs-blue flex items-center justify-center rounded"><span className="text-2xl font-bold">O</span></div>}
                      {sol.icon === 'strat' && <div className="w-12 h-12 border-2 border-hs-blue flex items-center justify-center rounded-full"><span className="text-2xl font-bold">S</span></div>}
                      {sol.icon === 'cult' && <div className="w-12 h-12 border-2 border-hs-blue flex items-center justify-center rounded-full"><span className="text-xl">👁️</span></div>}
                      {sol.icon === 'lead' && <Target size={48} className="text-hs-blue"/>}
                      {sol.icon === 'change' && <Brain size={48} className="text-hs-blue"/>}
                      {sol.icon === 'digi' && <div className="w-12 h-12 border-2 border-hs-blue flex items-center justify-center rounded-t-full"><span className="text-xl">🚀</span></div>}
                   </div>
                   <h3 className="text-xl font-bold text-hs-blue uppercase mb-2">{sol.title}</h3>
                   {sol.badge && (
                     <span className="inline-block bg-hs-accent text-white text-xs px-2 py-1 rounded mb-2 font-semibold">
                       {sol.badge}
                     </span>
                   )}
                   <p className="text-slate-600 text-sm leading-relaxed">
                     {sol.desc}
                   </p>
                </div>

                {/* Plus Button */}
                <div className={`absolute bottom-0 right-0 w-12 h-12 flex items-center justify-center text-white transition-colors ${sol.interactive ? 'bg-hs-accent group-hover:bg-hs-orange' : 'bg-hs-blue'}`}>
                  {sol.interactive ? <ArrowRight size={20} /> : <Plus size={20} />}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <button className="bg-[#667788] text-white px-8 py-3 uppercase text-sm font-semibold hover:bg-hs-blue transition-colors">
              Zu unseren Lösungen
            </button>
          </div>
        </div>
      </section>

      {/* CONSULTANTS SLIDER */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center mb-12">
           <h2 className="text-3xl font-bold text-hs-blue uppercase tracking-widest">Unsere Berater</h2>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 overflow-hidden group">
           <div className="flex space-x-4 overflow-x-auto pb-8 justify-center scrollbar-hide">
              {consultants.map((c, i) => (
                <div key={i} className="min-w-[280px] h-[350px] relative grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer">
                  <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-bold">{c.name}</p>
                  </div>
                </div>
              ))}
           </div>
           
           {/* Navigation Arrows (Visual only) */}
           <button className="absolute top-1/2 left-4 transform -translate-y-1/2 text-slate-300 hover:text-hs-blue">
             <ChevronLeft size={48} />
           </button>
           <button className="absolute top-1/2 right-4 transform -translate-y-1/2 text-slate-300 hover:text-hs-blue">
             <ChevronRight size={48} />
           </button>

           <div className="text-center mt-8">
             <button className="bg-[#667788] text-white px-8 py-3 uppercase text-sm font-semibold hover:bg-hs-blue transition-colors">
                Alle Berater
             </button>
           </div>
        </div>
      </section>

      {/* CUSTOMER QUOTES HEADER */}
      <section className="py-20 bg-white text-center border-t border-slate-100">
         <h2 className="text-3xl font-bold text-hs-blue uppercase tracking-widest mb-4">Das sagen unsere Kunden</h2>
         <p className="text-sm text-slate-500 uppercase cursor-pointer hover:text-hs-orange transition-colors">
           &gt; Das sind unsere Kunden &lt;
         </p>
      </section>

    </div>
  );
};